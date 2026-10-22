const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

async function main() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
        console.error('No credentials');
        return;
    }

    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailPass
        },
        logger: false
    });

    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    try {
        console.log("Connected to INBOX.");
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
        
        const searchCriteria = {
            since: since
        };
        
        console.log("Searching with:", searchCriteria);
        let count = 0;
        for await (let msg of client.fetch(searchCriteria, {envelope: true, source: true})) {
            if (msg.envelope && msg.envelope.from) {
                console.log(`Msg UID: ${msg.uid}, Subject: ${msg.envelope.subject}`);
                
                const parsed = await simpleParser(msg.source);
                const isToMe = parsed.to?.value?.some(t => t.address?.toLowerCase() === gmailUser.toLowerCase());
                console.log(`  -> isToMe: ${isToMe}`);
                if (isToMe) count++;
            }
        }
        console.log(`Found ${count} messages to me`);
    } catch (e) {
        console.error("Fetch error:", e);
    } finally {
        lock.release();
    }
    await client.logout();
}

main().catch(err => console.error(err));
