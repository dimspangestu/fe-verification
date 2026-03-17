import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SamlAcs() {
  const router = useRouter();
  const { SAMLResponse, RelayState } = router.query;

  // Redirect to /login with SAML params for processing
  useEffect(() => {
    if (SAMLResponse && RelayState) {
      router.replace({
        pathname: '/login',
        query: { SAMLResponse, RelayState },
      });
    }
  }, [SAMLResponse, RelayState, router]);

  // Could show a loading indicator if desired
  return null;
}