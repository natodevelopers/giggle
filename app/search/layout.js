"use client";

import styles from './layout.module.scss'
import ClientSearchBar from "@/components/shared/ClientSearchBar";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { BsSearch, BsImage, BsNewspaper } from 'react-icons/bs';
import { BsFillCameraVideoFill } from 'react-icons/bs';
import { BsMap } from 'react-icons/bs';
import { Suspense } from 'react';
import AccountBtn from '@/components/shared/AccountBtn';

function SearchLayoutContent({ children }) {
    const router = useRouter();
    const query = useSearchParams().get('q') || '';

    const pages = [
        {
            title: 'All',
            url: '/search?q=',
            icon: <BsSearch />,
            pathRegex: /^\/search$/
        },
        {
            title: 'Videos',
            url: '/search/videos?q=',
            icon: <BsFillCameraVideoFill />,
            pathRegex: /^\/search\/videos/
        },
        {
            title: 'Images',
            url: '/search/images?q=',
            icon: <BsImage />,
            pathRegex: /^\/search\/images/
        },
        {
            title: 'News',
            url: '/search/news?q=',
            icon: <BsNewspaper />,
            pathRegex: /^\/search\/news/
        },
        {
            title: 'Maps',
            url: 'https://www.google.com/maps/search/',
            icon: <BsMap />,
            pathRegex: /^\/search\/maps/
        },
    ]

    return (
        <div className={styles.search__layout}>
            <div className={styles.header}>
                <div className={styles.container__logo}>
                    <Link href={'/'}>
                        {/* <img src="/logo.png" alt="Giggle" className="styles.logo" /> */}
                        <h1 className={styles.logo}>Giggle</h1>
                        {/* <img className={styles.logo} src="/logo.png" alt="" /> */}
                        </Link>
                </div>
                <div className={styles.container__search}>
                    <div className={styles.search}>
                        <ClientSearchBar size="large" />
                    </div>
                    <div className={styles.menu}>
                        {pages.map(page => (
                            <Link
                                key={page.title}
                                prefetch={true}
                                href={page.url + query}
                                className={page.pathRegex.test(usePathname()) ? styles.active : ""}>
                                <span>{page.icon}</span><span>{page.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className={styles.container__account}>
                    <AccountBtn />
                </div>
            </div>
            <div className={styles.container__content}>
                {children}
            </div>
        </div>
    )
}

export default function SearchLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchLayoutContent>{children}</SearchLayoutContent>
        </Suspense>
    )
}