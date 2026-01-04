'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Page() {
    const { isLoaded, user } = useUser();
    const { openSignIn, signOut } = useClerk();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !user) {
            openSignIn();
        }
    }, [isLoaded, user, openSignIn]);

    if (!isLoaded) {
        return (
            <div className={styles.account_page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <SkeletonTheme baseColor="#343434" highlightColor="#565656">
                            <Skeleton width={200} height={200} circle={true} className={styles.userImg} style={{ margin: '0rem 3rem' }} />
                        </SkeletonTheme>
                    </div>
                    <div className={styles.body}>
                        <SkeletonTheme baseColor="#343434" highlightColor="#565656">
                            <Skeleton height={22} width={'50%'} style={{ margin: '10px 0 5px 0' }} />
                            <Skeleton height={14} count={6} width={'100%'} />
                        </SkeletonTheme>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null;
    }

    const UserEmail = user.emailAddresses[0]?.emailAddress || '';
    const UserName = user.fullName || user.firstName || UserEmail.split('@')[0];
    const UserImage = user.imageUrl;

    return (
        <div className={styles.account_page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <img src={UserImage} className={styles.userImg} alt="User Image" />
                </div>
                <div className={styles.body}>
                    <h1 className={styles.name}>{UserName}</h1>
                    <p className={styles.email}>{UserEmail}</p>
                    <div className={styles.buttons}>
                        <button onClick={() => router.push('/account/search-history')} >View Search History</button>
                        <button onClick={() => signOut({ redirectUrl: '/' })} className={styles.logout}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
