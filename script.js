// 1. FARA TELEGRAM WEB APP
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); 

const telegramUser = tg.initDataUnsafe?.user?.username || "Bako_" + Math.floor(Math.random() * 1000);
document.getElementById('username').innerText = telegramUser;

// 2. HAƊAWA DA SUPABASE (Amfani da bayanan da ka bayar)
const SUPABASE_URL = 'https://idywxcvcaceleikauhaa.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_At0MwDn_rtsFrGJC_MDqEg_wY6_h0uh'; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let userPoints = 0;

// 3. KARBO POINTS DAGA SUPABASE IDAN AN BUƊE APP
async function loadUserData() {
    try {
        let { data, error } = await supabase
            .from('work2task_users')
            .select('points')
            .eq('username', telegramUser)
            .single();

        if (data) {
            userPoints = data.points;
            document.getElementById('points').innerText = userPoints;
        } else {
            // Idan sabon memba ne, ƙirƙiri sabon row a DB
            await supabase.from('work2task_users').insert([{ username: telegramUser, points: 0 }]);
        }
    } catch (e) {
        console.log("Error loading user:", e);
    }
}
loadUserData();

// 4. TSARIN AUTOMATIC UPDATE NA POINTS ZUWA DATABASE
async function updatePoints(amount) {
    userPoints += amount;
    document.getElementById('points').innerText = userPoints;
    
    await supabase
        .from('work2task_users')
        .update({ points: userPoints })
        .eq('username', telegramUser);
}

// 5. KUNNA TALLA TA ATOMATIK (In-App Interstitial)
window.addEventListener('load', () => {
    if (typeof show_11682895 === 'function') {
        show_11682895({
            type: 'inApp',
            inAppSettings: {
                frequency: 2,
                capping: 0.1,
                interval: 30,
                timeout: 5,
                everyPage: false
            }
        });
    }
});

// 6. REWARDED INTERSTITIAL BUTTON
document.getElementById('btn-interstitial').addEventListener('click', () => {
    if (typeof show_11682895 === 'function') {
        show_11682895().then(() => {
            updatePoints(10);
            tg.showAlert("An taya ka murna! An ƙara maka maki 10.");
        }).catch(e => {
            tg.showAlert("Talla ba ta loda ba tukuna, sake jarawa nan gaba.");
        });
    } else {
        tg.showAlert("Ana kan loda ad SDK, dakata kaɗan.");
    }
});

// 7. REWARDED POPUP BUTTON
document.getElementById('btn-popup').addEventListener('click', () => {
    if (typeof show_11682895 === 'function') {
        show_11682895('pop').then(() => {
            updatePoints(5);
            tg.showAlert("An taya ka murna! An ƙara maka maki 5.");
        }).catch(e => {
            tg.showAlert("An samu matsala wajen nuna Talla.");
        });
    } else {
        tg.showAlert("Ana kan loda ad SDK, dakata kaɗan.");
    }
});