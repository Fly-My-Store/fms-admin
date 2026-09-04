import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/catalog-pending?tab=images');
}
