import { redirect } from 'next/navigation'

export default function Home() {
  return (
    redirect('https://github.com/sporadicus/portfolio')
  )
}
