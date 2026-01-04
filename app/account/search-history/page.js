import { currentUser } from "@clerk/nextjs/server"
import mongoClient from "@/utils/db"
import styles from "./page.module.scss";

export default async function Page() {
    const user = await currentUser();
    
    if (!user) {
        return <div className={styles.page}><p>Please sign in to view your search history.</p></div>;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = user.fullName || user.firstName || email?.split('@')[0];

    const client = await mongoClient;
    const db = client.db();

    console.log(email);

    const searchHistory = await db.collection("history").find({
        email: email
    }).limit(200).toArray();



    console.log(searchHistory);

    return (
        <div className={styles.page}>
            <h2> Search History of {name} </h2>

            {(searchHistory.length > 0)
                ? (
                    <div className={styles.history}>
                        {searchHistory.map((item, index) => (
                            <p className={styles.item} key={index}>
                                <span className={styles.item__timestamp}>
                                    {(item.localTimestamp)}
                                </span>
                                <span className={styles.item__query}>
                                    {item.query}
                                </span>
                                <span className={styles.item__path}>
                                    {item.path}
                                </span>
                            </p>
                        ))}
                    </div>
                )
                : (<p>No Search History found!</p>)
            }

        </div>
    )
}