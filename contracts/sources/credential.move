/// WalTrust — Decentralized Credential Verification System
/// Stores credential metadata on-chain, documents on Walrus
#[allow(duplicate_alias, unused_use)]
module waltrust::credential {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::Clock;
    use sui::vec_map::{Self, VecMap};

    // ============ ERROR CODES ============
    const EIssuerNotActive: u64 = 1001;
    const ENotCredentialIssuer: u64 = 1002;
    const EAlreadyRevoked: u64 = 1003;

    // ============ STRUCTS ============

    /// Main credential object — transferable NFT
    public struct Credential has key, store {
        id: UID,
        /// Walrus Blob ID — original document stored here
        walrus_blob_id: String,
        /// Walrus Blob ID for metadata JSON
        walrus_metadata_blob_id: String,
        /// SHA-256 hash of document (second verification layer)
        document_hash: vector<u8>,
        /// Credential type: "degree" | "certificate" | "work_experience"
        credential_type: String,
        /// Credential title (e.g., "S1 Teknik Informatika")
        title: String,
        /// Issuer address
        issuer: address,
        /// Issuer display name
        issuer_name: String,
        /// Credential recipient
        recipient: address,
        /// Recipient display name
        recipient_name: String,
        /// Issued timestamp (Unix ms)
        issued_at: u64,
        /// Expiry timestamp (0 = no expiry)
        expires_at: u64,
        /// Status: true = valid, false = revoked
        is_valid: bool,
        /// Extensible extra fields
        extra_fields: VecMap<String, String>,
    }

    /// Capability for verified issuer
    public struct IssuerCap has key, store {
        id: UID,
        issuer_address: address,
        issuer_name: String,
        is_active: bool,
    }

    /// Admin capability for managing issuer registry
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared registry tracking all issuers
    public struct IssuerRegistry has key {
        id: UID,
        issuers: VecMap<address, bool>,
    }

    // ============ EVENTS ============

    public struct CredentialIssued has copy, drop {
        credential_id: ID,
        issuer: address,
        recipient: address,
        walrus_blob_id: String,
        credential_type: String,
        issued_at: u64,
    }

    public struct CredentialRevoked has copy, drop {
        credential_id: ID,
        revoked_by: address,
        revoked_at: u64,
    }

    public struct CredentialVerified has copy, drop {
        credential_id: ID,
        verifier: address,
        is_valid: bool,
        verified_at: u64,
    }

    public struct IssuerApproved has copy, drop {
        issuer: address,
        issuer_name: String,
        approved_by: address,
    }

    public struct IssuerDeactivated has copy, drop {
        issuer: address,
        deactivated_by: address,
    }

    // ============ INIT ============

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        let registry = IssuerRegistry {
            id: object::new(ctx),
            issuers: vec_map::empty(),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
    }

    // ============ PUBLIC ACCESSORS ============

    public fun is_issuer_registered(registry: &IssuerRegistry, addr: address): bool {
        vec_map::contains(&registry.issuers, &addr)
    }

    public fun is_issuer_active(registry: &IssuerRegistry, addr: address): bool {
        if (vec_map::contains(&registry.issuers, &addr)) {
            *vec_map::get(&registry.issuers, &addr)
        } else {
            false
        }
    }

    // ============ ISSUER MANAGEMENT ============

    /// Admin approve new issuer (university, certification body)
    public fun approve_issuer(
        _admin: &AdminCap,
        registry: &mut IssuerRegistry,
        issuer_address: address,
        issuer_name: vector<u8>,
        ctx: &mut TxContext
    ) {
        let cap = IssuerCap {
            id: object::new(ctx),
            issuer_address,
            issuer_name: string::utf8(issuer_name),
            is_active: true,
        };
        if (vec_map::contains(&registry.issuers, &issuer_address)) {
            *vec_map::get_mut(&mut registry.issuers, &issuer_address) = true;
        } else {
            vec_map::insert(&mut registry.issuers, issuer_address, true);
        };
        event::emit(IssuerApproved {
            issuer: issuer_address,
            issuer_name: cap.issuer_name,
            approved_by: tx_context::sender(ctx),
        });
        transfer::transfer(cap, issuer_address);
    }

    /// Admin deactivate an issuer
    public fun deactivate_issuer(
        _admin: &AdminCap,
        registry: &mut IssuerRegistry,
        issuer_cap: &mut IssuerCap,
        ctx: &mut TxContext,
    ) {
        issuer_cap.is_active = false;
        *vec_map::get_mut(&mut registry.issuers, &issuer_cap.issuer_address) = false;
        event::emit(IssuerDeactivated {
            issuer: issuer_cap.issuer_address,
            deactivated_by: tx_context::sender(ctx),
        });
    }

    // ============ CREDENTIAL OPERATIONS ============

    /// Issue new credential — only active IssuerCap holders can call
    public fun issue_credential(
        issuer_cap: &IssuerCap,
        walrus_blob_id: vector<u8>,
        walrus_metadata_blob_id: vector<u8>,
        document_hash: vector<u8>,
        credential_type: vector<u8>,
        title: vector<u8>,
        recipient: address,
        recipient_name: vector<u8>,
        expires_at: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(issuer_cap.is_active, EIssuerNotActive);

        let issued_at = clock.timestamp_ms();
        let credential_id = object::new(ctx);
        let cred_obj_id = object::uid_to_inner(&credential_id);

        let credential = Credential {
            id: credential_id,
            walrus_blob_id: string::utf8(walrus_blob_id),
            walrus_metadata_blob_id: string::utf8(walrus_metadata_blob_id),
            document_hash,
            credential_type: string::utf8(credential_type),
            title: string::utf8(title),
            issuer: issuer_cap.issuer_address,
            issuer_name: issuer_cap.issuer_name,
            recipient,
            recipient_name: string::utf8(recipient_name),
            issued_at,
            expires_at,
            is_valid: true,
            extra_fields: vec_map::empty(),
        };

        event::emit(CredentialIssued {
            credential_id: cred_obj_id,
            issuer: issuer_cap.issuer_address,
            recipient,
            walrus_blob_id: credential.walrus_blob_id,
            credential_type: credential.credential_type,
            issued_at,
        });

        transfer::transfer(credential, recipient);
    }

    /// Revoke credential — only original issuer can revoke
    public fun revoke_credential(
        issuer_cap: &IssuerCap,
        credential: &mut Credential,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(issuer_cap.issuer_address == credential.issuer, ENotCredentialIssuer);
        assert!(credential.is_valid, EAlreadyRevoked);

        credential.is_valid = false;

        event::emit(CredentialRevoked {
            credential_id: object::uid_to_inner(&credential.id),
            revoked_by: tx_context::sender(ctx),
            revoked_at: clock.timestamp_ms(),
        });
    }

    /// Public verify — anyone can query credential status
    public fun verify_credential(
        credential: &Credential,
        clock: &Clock,
        ctx: &mut TxContext
    ): bool {
        let now = clock.timestamp_ms();
        let not_expired = credential.expires_at == 0 || now < credential.expires_at;
        let is_valid = credential.is_valid && not_expired;

        event::emit(CredentialVerified {
            credential_id: object::uid_to_inner(&credential.id),
            verifier: tx_context::sender(ctx),
            is_valid,
            verified_at: now,
        });
        is_valid
    }

    /// Add extra field to credential (e.g., "student_id", "gpa")
    public fun add_extra_field(
        issuer_cap: &IssuerCap,
        credential: &mut Credential,
        key: vector<u8>,
        value: vector<u8>,
    ) {
        assert!(issuer_cap.issuer_address == credential.issuer, ENotCredentialIssuer);
        vec_map::insert(&mut credential.extra_fields, string::utf8(key), string::utf8(value));
    }

    // ============ VIEW FUNCTIONS ============

    public fun get_walrus_blob_id(c: &Credential): &String { &c.walrus_blob_id }
    public fun get_metadata_blob_id(c: &Credential): &String { &c.walrus_metadata_blob_id }
    public fun get_issuer(c: &Credential): address { c.issuer }
    public fun get_issuer_name(c: &Credential): &String { &c.issuer_name }
    public fun get_recipient(c: &Credential): address { c.recipient }
    public fun get_recipient_name(c: &Credential): &String { &c.recipient_name }
    public fun get_credential_type(c: &Credential): &String { &c.credential_type }
    public fun get_title(c: &Credential): &String { &c.title }
    public fun is_valid(c: &Credential): bool { c.is_valid }
    public fun is_expired(c: &Credential, clock: &Clock): bool {
        c.expires_at > 0 && clock.timestamp_ms() >= c.expires_at
    }
    public fun get_issued_at(c: &Credential): u64 { c.issued_at }
    public fun get_expires_at(c: &Credential): u64 { c.expires_at }
    public fun get_document_hash(c: &Credential): &vector<u8> { &c.document_hash }

    // ============ TESTS ============

    #[test_only]
    use sui::test_scenario;
    #[test_only]
    use sui::clock;

    // === Helper: init + approve issuer ===
    #[test_only]
    fun setup_issuer(
        scenario: &mut test_scenario::Scenario,
        admin: address,
        issuer_addr: address,
    ) {
        test_scenario::next_tx(scenario, admin);
        {
            init(test_scenario::ctx(scenario));
            let test_clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::share_for_testing(test_clock);
        };

        test_scenario::next_tx(scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(scenario);
            approve_issuer(
                &admin_cap,
                &mut registry,
                issuer_addr,
                b"Test University",
                test_scenario::ctx(scenario),
            );
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(scenario, admin_cap);
        };
    }

    // === Helper: setup + issue credential ===
    #[test_only]
    fun setup_and_issue(
        scenario: &mut test_scenario::Scenario,
        admin: address,
        issuer_addr: address,
        recipient: address,
        expires_at: u64,
    ) {
        setup_issuer(scenario, admin, issuer_addr);

        test_scenario::next_tx(scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(scenario);
            let clock = test_scenario::take_shared<Clock>(scenario);
            issue_credential(
                &cap,
                b"walrus_blob_id_123",
                b"metadata_blob_id_456",
                b"document_hash_abc",
                b"degree",
                b"Computer Science",
                recipient,
                b"Alice",
                expires_at,
                &clock,
                test_scenario::ctx(scenario),
            );
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(scenario, cap);
        };
    }

    // ============ BASIC TESTS ============

    #[test]
    fun test_issue_credential_success() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            assert!(*get_title(&cred) == string::utf8(b"Computer Science"), 0);
            assert!(*get_credential_type(&cred) == string::utf8(b"degree"), 1);
            assert!(get_issuer(&cred) == issuer_addr, 2);
            assert!(get_recipient(&cred) == recipient, 3);
            assert!(get_walrus_blob_id(&cred) == &string::utf8(b"walrus_blob_id_123"), 4);
            assert!(get_metadata_blob_id(&cred) == &string::utf8(b"metadata_blob_id_456"), 5);
            assert!(is_valid(&cred), 6);
            assert!(get_expires_at(&cred) == 0, 7);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_issuer_registry_accessors() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let mut scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin);
        { init(test_scenario::ctx(&mut scenario)); };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            assert!(!is_issuer_registered(&registry, issuer_addr), 0);
            assert!(!is_issuer_active(&registry, issuer_addr), 1);
            test_scenario::return_shared(registry);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            approve_issuer(&admin_cap, &mut registry, issuer_addr, b"University", test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            assert!(is_issuer_registered(&registry, issuer_addr), 2);
            assert!(is_issuer_active(&registry, issuer_addr), 3);
            test_scenario::return_shared(registry);
        };
        test_scenario::end(scenario);
    }

    // ============ REVOCATION TESTS ============

    #[test]
    fun test_revoke_credential_success() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            revoke_credential(&cap, &mut cred, &clock, test_scenario::ctx(&mut scenario));
            assert!(!is_valid(&cred), 0);
            test_scenario::return_shared(clock);
            transfer::public_transfer(cred, recipient);
            test_scenario::return_to_sender(&mut scenario, cap);
        };

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            assert!(!is_valid(&cred), 1);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyRevoked)]
    fun test_revoke_already_revoked_fails() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            revoke_credential(&cap, &mut cred, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(clock);
            transfer::public_transfer(cred, issuer_addr);
            test_scenario::return_to_sender(&mut scenario, cap);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            revoke_credential(&cap, &mut cred, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(clock);
            transfer::public_transfer(cred, issuer_addr);
            test_scenario::return_to_sender(&mut scenario, cap);
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotCredentialIssuer)]
    fun test_revoke_by_wrong_issuer_fails() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let wrong_issuer = @0x33;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            approve_issuer(&admin_cap, &mut registry, wrong_issuer, b"Fake University", test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
        };

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, wrong_issuer);
        };

        test_scenario::next_tx(&mut scenario, wrong_issuer);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            revoke_credential(&cap, &mut cred, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(clock);
            transfer::public_transfer(cred, wrong_issuer);
            test_scenario::return_to_sender(&mut scenario, cap);
        };
        test_scenario::end(scenario);
    }

    // ============ VERIFICATION TESTS ============

    #[test]
    fun test_verify_valid_credential() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let verifier = @0x44;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, verifier);
        };

        test_scenario::next_tx(&mut scenario, verifier);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            let result = verify_credential(&cred, &clock, test_scenario::ctx(&mut scenario));
            assert!(result, 0);
            assert!(is_valid(&cred), 1);
            assert!(!is_expired(&cred, &clock), 2);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_verify_revoked_credential() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let verifier = @0x44;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            revoke_credential(&cap, &mut cred, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(clock);
            transfer::public_transfer(cred, verifier);
            test_scenario::return_to_sender(&mut scenario, cap);
        };

        test_scenario::next_tx(&mut scenario, verifier);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            let result = verify_credential(&cred, &clock, test_scenario::ctx(&mut scenario));
            assert!(!result, 0);
            assert!(!is_valid(&cred), 1);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_verify_expired_credential() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let verifier = @0x44;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 1);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, verifier);
        };

        test_scenario::next_tx(&mut scenario, verifier);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let mut clock = test_scenario::take_shared<Clock>(&mut scenario);
            clock::set_for_testing(&mut clock, 9999);
            let result = verify_credential(&cred, &clock, test_scenario::ctx(&mut scenario));
            assert!(!result, 0);
            assert!(is_expired(&cred, &clock), 1);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    // ============ ISSUER MANAGEMENT TESTS ============

    #[test]
    #[expected_failure(abort_code = EIssuerNotActive)]
    fun test_issue_by_inactive_issuer_fails() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_issuer(&mut scenario, admin, issuer_addr);

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            transfer::public_transfer(cap, admin);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            let mut cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            deactivate_issuer(&admin_cap, &mut registry, &mut cap, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
            transfer::public_transfer(cap, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            issue_credential(&cap, b"blob", b"meta", b"hash", b"degree", b"Title", recipient, b"Name", 0, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&mut scenario, cap);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_deactivate_reactivate_issuer() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let mut scenario = test_scenario::begin(admin);

        setup_issuer(&mut scenario, admin, issuer_addr);

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            transfer::public_transfer(cap, admin);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            let mut cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            deactivate_issuer(&admin_cap, &mut registry, &mut cap, test_scenario::ctx(&mut scenario));
            assert!(!is_issuer_active(&registry, issuer_addr), 0);
            assert!(!cap.is_active, 1);
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
            transfer::public_transfer(cap, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            transfer::public_transfer(cap, admin);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            approve_issuer(&admin_cap, &mut registry, issuer_addr, b"Test University", test_scenario::ctx(&mut scenario));
            assert!(is_issuer_active(&registry, issuer_addr), 2);
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
        };
        test_scenario::end(scenario);
    }

    // ============ EXTRA FIELDS TESTS ============

    #[test]
    fun test_add_extra_field() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, issuer_addr);
        };

        test_scenario::next_tx(&mut scenario, issuer_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            add_extra_field(&cap, &mut cred, b"student_id", b"12345");
            add_extra_field(&cap, &mut cred, b"gpa", b"3.8");
            assert!(vec_map::contains(&cred.extra_fields, &string::utf8(b"student_id")), 0);
            assert!(vec_map::contains(&cred.extra_fields, &string::utf8(b"gpa")), 1);
            test_scenario::return_to_sender(&mut scenario, cap);
            transfer::public_transfer(cred, recipient);
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotCredentialIssuer)]
    fun test_add_extra_field_wrong_issuer_fails() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let wrong_addr = @0x33;
        let recipient = @0x22;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
            let mut registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            approve_issuer(&admin_cap, &mut registry, wrong_addr, b"Wrong", test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&mut scenario, admin_cap);
        };

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, wrong_addr);
        };

        test_scenario::next_tx(&mut scenario, wrong_addr);
        {
            let cap = test_scenario::take_from_sender<IssuerCap>(&mut scenario);
            let mut cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            add_extra_field(&cap, &mut cred, b"key", b"value");
            test_scenario::return_to_sender(&mut scenario, cap);
            transfer::public_transfer(cred, wrong_addr);
        };
        test_scenario::end(scenario);
    }

    // ============ EDGE CASE TESTS ============

    #[test]
    fun test_credential_transfer() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let third_party = @0x55;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 0);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, third_party);
        };

        test_scenario::next_tx(&mut scenario, third_party);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            assert!(get_recipient(&cred) == recipient, 0);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_verify_credential_not_expired() {
        let admin = @0xAD;
        let issuer_addr = @0x11;
        let recipient = @0x22;
        let verifier = @0x44;
        let mut scenario = test_scenario::begin(admin);

        setup_and_issue(&mut scenario, admin, issuer_addr, recipient, 9999999999999);

        test_scenario::next_tx(&mut scenario, recipient);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            transfer::public_transfer(cred, verifier);
        };

        test_scenario::next_tx(&mut scenario, verifier);
        {
            let cred = test_scenario::take_from_sender<Credential>(&mut scenario);
            let clock = test_scenario::take_shared<Clock>(&mut scenario);
            let result = verify_credential(&cred, &clock, test_scenario::ctx(&mut scenario));
            assert!(result, 0);
            assert!(!is_expired(&cred, &clock), 1);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&mut scenario, cred);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_empty_issuer_registry() {
        let admin = @0xAD;
        let random_addr = @0x99;
        let mut scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin);
        { init(test_scenario::ctx(&mut scenario)); };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let registry = test_scenario::take_shared<IssuerRegistry>(&mut scenario);
            assert!(!is_issuer_registered(&registry, random_addr), 0);
            assert!(!is_issuer_active(&registry, random_addr), 1);
            test_scenario::return_shared(registry);
        };
        test_scenario::end(scenario);
    }
}
