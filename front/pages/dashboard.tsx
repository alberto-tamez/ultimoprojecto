import { GetServerSideProps } from 'next';
import { getTokenCookie } from '../lib/session';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getTokenCookie(req);

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: token,
    },
  };
};

export default function Dashboard({ email }: { email: string }) {
  return (
    <div>
      <h1>Bienvenido</h1>
      <p>Estás logueado como: {email}</p>
    </div>
  );
}