/// WalTrust Issuer Registry Module
/// Thin wrapper providing convenient issuer query functions
#[allow(unused_field)]
module waltrust::issuer {
    use waltrust::credential;

    public fun is_registered_issuer(registry: &credential::IssuerRegistry, addr: address): bool {
        credential::is_issuer_registered(registry, addr)
    }

    public fun is_active_issuer(registry: &credential::IssuerRegistry, addr: address): bool {
        credential::is_issuer_active(registry, addr)
    }
}
