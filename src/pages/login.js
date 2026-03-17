// import { useEffect, useState } from 'react';
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import Cookies from 'js-cookie';
// import apiService from '@/lib/apiService';
// import loadinguiii from '@/assets/Comp3_3.gif'; 

// export default function Login() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);

//   // Called after receiving SAMLResponse and RelayState
//   const login = async ({ SAMLResponse, RelayState }) => {
//     try {
//       setIsLoading(true);
//       const response = await apiService('POST', '/saml/login', {
//         data: { SAMLResponse, RelayState },
//       });
//       if (response.success) {
//         const profile = await apiService('GET', '/profile', {
//           headers: {
//             Authorization: `Bearer ${response.token}`,
//             'log-name': 'WhatsApp',
//           },
//         });
//         if (profile.success) {
//           Cookies.set('__login_session', response.token, { expires: 1 });
//           router.push('/dashboard/auth');
//         }
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setIsLoading(false);
//     }
//   };

//   // Initiates SAML AuthnRequest
//   const nextRequest = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('https://api-live.uiii.ac.id/api/saml/request', {
//         method: 'POST',
//         headers: {
//           'key': 'eiWee8ep9due4deeshoa8Peichai8Eih',
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           url_entity_id: `${window.location.origin}/saml/metadata`,
//           url_redirect_acs: `${window.location.origin}/login`,
//           acs_binding: 'Redirect',
//         }),
//       });
//       const data = await response.json();
//       if (data.success && data.redirect) {
//         window.location.href = data.redirect;
//       }
//     } catch (error) {
//       console.error('SAML request error:', error);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const url = new URL(window.location.href);
//     const SAMLResponse = url.searchParams.get('SAMLResponse')?.replaceAll(' ', '+');
//     const RelayState = url.searchParams.get('RelayState');
//     if (!SAMLResponse || !RelayState) {
//       nextRequest();
//     } else {
//       login({ SAMLResponse, RelayState });
//     }
//   }, []);

//   return (
//     <>
//       <Head>
//         <title>Login</title>
//       </Head>
//       <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
//         {isLoading ? (
//           <>
//             <img src={loadinguiii.src} alt="Loading" width={150} />
//             <p style={{ fontSize: '1.2rem', color: '#333', fontWeight: '500' }}>Please wait, redirecting to login...</p>
//           </>
//         ) : (
//           <p>Login in progress...</p>
//         )}
//       </main>
//     </>
//   );
// }
