import { redirect } from 'next/navigation';

export default function HomePage() {
  // 채널 목록 페이지로 리다이렉트
  redirect('/channel');
}
