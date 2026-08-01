import { redirect } from 'next/navigation';

export default function Home() {
  //redirect to the admin login page
  redirect('/admin/login');
  return null;
}
