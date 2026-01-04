import AccountBtn from '@/components/shared/AccountBtn'
import ClientSearchBar from '@/components/shared/ClientSearchBar'
import styles from './page.module.scss'

export default function Home() {
  return (
    <>
      <div className={styles.accountBtn_container}>
        <AccountBtn />
      </div>
      {/* <h1 className={styles.logo}>SearchEx</h1> */}
      <img src="/logo.png" className={styles.logo} alt="" />
      <p className={styles.tagline}>Search Engine by Natodev. It's free, easy to use, and open source.</p>
      <ClientSearchBar />
    </>
  )
}
