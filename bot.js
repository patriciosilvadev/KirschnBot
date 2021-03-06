// Code (c) 2016 Malte "Kirschn" Wolff
// -----------------------------------
// Erstmal alle Libs inkludieren
var irc = require("irc"), // Wozu sollte auf offener Hand liegen
    mysql = require('mysql'), // MySQL wird als Datenbankbackend genutzt
    util = require("util"), // Logging & Debugging
    request = require("request"); // API Abfragen und http Parameter
fs = require("fs"), // Config File lesen
    gotcredfromstdin = false, // Variable wird genutzt im zu Identifizieren ob es der Master Bot oder Fork mit anderen Crds ist
    configfile = String(fs.readFileSync("config.dong", "utf-8")).split(",,"), // IRC und MySQL Passwörter aus config.dong auslesen, mit ,, getrennt
    botusername = "kirschnbot", // Lokalen Nutzernamen festlegen, im Falle, dass er der Master ist
    ismaster = true, // Identifizierung Fork?
    subprocesses = [], // Hierrein werden Forkobjekte gelegt
    activebotprocessnames = [], // Ebenfalls
    spawn = require('child_process').spawn, // Fork Prozesse geniereren
    mail = require("sendmail")(), // Komische Mails senden wenn alles explodiert
    linkregex = /[\d\sa-zA-Z][.](com|to|ly|aaa|aarp|abb|abbott|abogado|ac|academy|accenture|accountant|accountants|aco|active|actor|ad|adac|ads|adult|ae|aeg|aero|af|afl|ag|agency|ai|aig|airforce|airtel|al|alibaba|alipay|allfinanz|alsace|am|amica|amsterdam|analytics|android|ao|apartments|app|apple|aq|aquarelle|ar|aramco|archi|army|arpa|arte|as|asia|associates|at|attorney|au|auction|audi|audio|author|auto|autos|aw|ax|axa|az|azure|ba|baidu|band|bank|bar|barcelona|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bcn|bd|be|beats|beer|bentley|berlin|best|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|bloomberg|blue|bm|bms|bmw|bn|bnl|bnpparibas|bo|boats|boehringer|bom|bond|boo|book|boots|bosch|bostik|bot|boutique|br|bradesco|bridgestone|broadway|broker|brother|brussels|bs|bt|budapest|bugatti|build|builders|business|buy|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|call|camera|camp|cancerresearch|canon|capetown|capital|car|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cba|cbn|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|chat|cheap|chloe|christmas|chrome|church|ci|cipriani|circle|cisco|citic|city|cityeats|ck|cl|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|commbank|community|company|compare|computer|comsec|condos|construction|consulting|contact|contractors|cooking|cool|coop|corsica|country|coupon|coupons|courses|cr|credit|creditcard|creditunion|cricket|crown|crs|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|download|drive|dubai|durban|dvag|dz|earth|eat|ec|edeka|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fage|fail|fairwinds|faith|family|fan|fans|farm|fashion|fast|feedback|ferrero|fi|film|final|finance|financial|firestone|firmdale|fish|fishing|fit|fitness|fj|fk|flickr|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|ford|forex|forsale|forum|foundation|fox|fr|fresenius|frl|frogans|frontier|fund|furniture|futbol|fyi|ga|gal|gallery|gallup|game|garden|gb|gbiz|gd|gdn|ge|gea|gent|genting|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|got|gov|gp|gq|gr|grainger|graphics|gratis|green|gripe|group|gs|gt|gu|gucci|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|hdfcbank|health|healthcare|help|helsinki|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|hoteles|hotmail|house|how|hr|hsbc|ht|hu|hyundai|ibm|icbc|ice|icu|id|ie|ifm|iinet|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insurance|insure|int|international|investments|io|ipiranga|iq|ir|irish|is|iselect|ist|istanbul|it|itau|iwc|jaguar|java|jcb|je|jetzt|jewelry|jlc|jll|jm|jmp|jo|jobs|joburg|jot|joy|jp|jprs|juegos|kaufen|kddi|ke|kfh|kg|kh|ki|kia|kim|kinder|kitchen|kiwi|km|kn|koeln|komatsu|kp|kpn|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|lamborghini|lamer|lancaster|land|landrover|lanxess|lasalle|lat|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|legal|lexus|lgbt|li|liaison|lidl|life|lifeinsurance|lifestyle|lighting|like|limited|limo|lincoln|linde|link|live|living|lixil|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltd|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|makeup|man|management|mango|market|marketing|markets|marriott|mba|mc|md|me|med|media|meet|melbourne|meme|memorial|men|menu|meo|mg|mh|miami|microsoft|mil|mini|mk|ml|mm|mma|mn|mo|mobi|mobily|moda|moe|moi|mom|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|movistar|mp|mq|mr|ms|mt|mtn|mtpc|mtr|mu|museum|mutuelle|mv|mw|mx|my|mz|na|nadex|nagoya|name|natura|navy|nc|ne|nec|net|netbank|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|nikon|ninja|nissan|nl|no|nokia|norton|nowruz|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|office|okinawa|om|omega|one|ong|onl|online|ooo|oracle|orange|org|organic|origins|osaka|otsuka|ovh|pa|page|pamperedchef|panerai|paris|pars|partners|parts|party|pe|pet|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pid|pin|ping|pink|pizza|pk|pl|place|play|playstation|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|promo|properties|property|protection|ps|pt|pub|pw|pwc|py|qa|qpon|quebec|quest|racing|re|read|realtor|realty|recipes|red|redstone|redumbrella|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|ricoh|rio|rip|ro|rocher|rocks|rodeo|room|rs|rsvp|ru|ruhr|run|rw|rwe|ryukyu|sa|saarland|safe|safety|sakura|sale|salon|samsung|sandvik|sandvikcoromant|sanofi|sap|sapo|sarl|sas|saxo|sb|sbs|sc|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scor|scot|sd|se|seat|security|seek|select|sener|services|seven|sew|sex|sexy|sfr|sg|sh|sharp|shell|shia|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|skin|sky|skype|sl|sm|smile|sn|sncf|so|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|space|spiegel|spot|spreadbetting|sr|srl|st|stada|star|starhub|statefarm|statoil|stc|stcgroup|stockholm|storage|store|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiss|sx|sy|sydney|symantec|systems|sz|tab|taipei|taobao|tatamotors|tatar|tattoo|tax|taxi|tc|tci|td|team|tech|technology|tel|telecity|telefonica|temasek|tennis|tf|tg|th|thd|theater|theatre|tickets|tienda|tiffany|tips|tires|tirol|tj|tk|tl|tm|tmall|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toyota|toys|tr|trade|trading|training|travel|travelers|travelersinsurance|trust|trv|tt|tube|tui|tunes|tushu|tv|tvs|tw|tz|ua|ubs|ug|uk|unicom|university|uno|uol|us|uy|uz|va|vacations|vana|vc|ve|vegas|ventures|verisign|versicherung|vet|vg|vi|viajes|video|viking|villas|vin|vip|virgin|vision|vista|vistaprint|viva|vlaanderen|vn|vodka|volkswagen|vote|voting|voto|voyage|vu|wales|walter|wang|wanggou|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|wme|wolterskluwer|work|works|world|ws|wtc|wtf|xbox|xerox|xin|xn|xperia|xxx|xyz|yachts|yahoo|yamaxun|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zara|zero|zip|zm|zone|zuerich|zw)/ig; // Linkerkennung
timers = [],
    activitytimer = {}; // Timer IDs aus SetInterval ablegen
var concat = require('concat-stream'); // Wird für Strawpoll gebraucht
var JSONStream = require('JSONStream'); // Ebenfalls für Strawpoll
var strawpoll = require('strawpoll'); // Backend für !strawpoll
util.log("KirschnBot V2.0.0.0");
util.log("Starting Connection to SQL Server");
// STDIN stuff. Wird genutzt um IRC Creds für Subprozesse zu übergeben, Master forkt sich und schiebt die Creds via stdin an das Child weiter
process.stdin.setEncoding('utf8'); // Encoding für stdin setzen
process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        console.log("Got Data from STDIN");
        if (chunk.split("||") !== chunk) {
            data = chunk.split("||"); // || ist seperator um username von passwort bzw. oauth zu trennen
            console.log("Got Data from STDIN");
            if (data[0] == "youare") {
                // Master Variablen invertieren
                ismaster = false;
                gotcredfromstdin = true;
                botusername = data[1];
                botoauthtoken = data[2];
            }
        }
    }
});
var lockedcommands = []; // Array für Variablen für weil wegen Bashschutz
var friendlymode = false;
// Init für konstante Variablen fertig
// 2 Sekunden warten bevor Bootstrap weitergeht. Man weiß ja nie was Bash da mit dem Stdin macht.
console.log("sysready");
setTimeout(function() {
    if (!gotcredfromstdin) {
        botoauthtoken = configfile[0]; // Wenn keine Daten aus stdin Passwort aus Datei nutzen
    }


    var sqlconnection = mysql.createConnection({ //SQL initieren
            host: '127.0.0.1',
            user: 'kirschnbot',
            password: configfile[1], // ist zweiter teil aus config file
            database: 'kirschnbot'
        }),
        sysconf = {
            modchan: ['#kirschnbot', '#kirschnkiller', '#thekirschn', '#shusky2812'], // Aus diesen Kanälen kann !join genutzt werden
            globaladmins: ['kirschnkiller', 'shusky2812', "kirschnbot", 'thekirschn'], // Hardcoded Level 0
            globaladminuserlevel: 0
        };

    sqlconnection.connect(function(err) { // SQL Verbindung Initieren
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + sqlconnection.threadId); // SUCCESS
    });
    // IRC Verbindung starten
    util.log("Connecting to IRC");
    var client = new irc.Client('irc.twitch.tv', botusername, {
        userName: botusername, // IRC Name
        realName: botusername, // Wird nicht wirklich gebraucht
        port: 6667,
        localAddress: null,
        debug: true, // Nur für Testinstanz an, genz nützlich um Pings, gesendete Nachrichten etc. zu sehen
        showErrors: true,
        autoRejoin: true,
        autoConnect: true,
        channels: [],
        secure: false,
        selfSigned: false,
        certExpired: false,
        floodProtection: false,
        floodProtectionDelay: 1000,
        sasl: false,
        stripColors: false,
        channelPrefixes: "&#",
        messageSplit: 999, // 999 ist maximale Twitch Nachrichtenlänge
        encoding: '',
        password: botoauthtoken // Wirde zuvor festgelegt aus A) Stdin B) Config File
    });

    var clientaws = new irc.Client('irc.chat.twitch.tv', botusername, {
        userName: botusername, // IRC Name
        realName: botusername, // Wird nicht wirklich gebraucht
        port: 80,
        localAddress: null,
        debug: true, // Nur für Testinstanz an, genz nützlich um Pings, gesendete Nachrichten etc. zu sehen
        showErrors: true,
        autoRejoin: true,
        autoConnect: true,
        channels: [],
        secure: false,
        selfSigned: false,
        certExpired: false,
        floodProtection: false,
        floodProtectionDelay: 1000,
        sasl: false,
        stripColors: false,
        channelPrefixes: "&#",
        messageSplit: 999, // 999 ist maximale Twitch Nachrichtenlänge
        encoding: '',
        password: botoauthtoken // Wirde zuvor festgelegt aus A) Stdin B) Config File
    });
    setTimeout(function() {
        client.send('CAP', 'REQ', 'twitch.tv/commands');
        clientaws.send('CAP', 'REQ', 'twitch.tv/commands');


        var activebots = { // Caching Variablen definieren
            commands: {},
            users: {},
            config: {}
        };
        util.log("Init Complete");

        function whisper(username, message) {
            client.send("PRIVMSG", "#jtv", "/w " + username + " " + message);
        }

        function isglobaladmin(username) { // Sinnloseste Funktion ever. Returnt true wenn username in global admin liste ist
            util.log("IS global admin: " + username);
            if (sysconf.globaladmins.indexOf(username) !== -1) {
                return true;
            } else {
                return false;
            }
        }

        function ismodapi(username, channel) { // Array Index mods wird geschrieben wenn API Request gemacht wurde im Mods heraus zu finden
            console.log("Checking if " + username + " is mod in channel " + channel);
            if (activebots["users"][channel] !== undefined) { // Wird Fallback für WhatsApp Backend
                if (activebots["users"][channel]["mods"].indexOf(username) !== -1) { // Eigentliche Überprüfung
                    return true;
                } else {
                    return false;
                }
            } else {
                return false; // Fallback false return
            }
        }

        function issubapi(username, channel) { // Array Index mods wird geschrieben wenn API Request gemacht wurde im Mods heraus zu finden
            console.log("Checking if " + username + " is sub in channel " + channel);
            if (activebots["users"][channel] !== undefined) { // Wird Fallback für WhatsApp Backend
                if (activebots["users"][channel]["subs"].indexOf(username) !== -1) { // Eigentliche Überprüfung
                    return true;
                } else {
                    return false;
                }
            } else {
                return false; // Fallback false return
            }
        }

        function ischannelowner(username, channel) { // Kann irgendwann entfernt werden, braucht eh keiner
            if (username == channel.substr(1, channel.length)) { //substr weil wegen dem # vor Channel
                return true;
            } else {
                return false;
            }
        }

        function getuserlevel(username, channel, nextcode) { // Inkrementale Funktion! username und channel sollten selbsterklärend sein.
            // Nextcode ist eine Callbackfunktion an die das Userlevel übergeben wird
            // Oft nicht Synchron, da MySQL abfragen gemacht werden müssen, wenn Nutzername nicht im Cache ist
            if (activebots["users"][channel] !== undefined) { // Fallback für WhatsApp
                if (isglobaladmin(username)) {
                    nextcode(sysconf.globaladminuserlevel); // Wenn Global Admin Weiter mit hardcoded adminlevel
                } else {
                    if (username !== channel.substr(1, channel.length)) { // Username nicht gleich Substring vom Channelname? Wenn ja ist User strimmer
                        if (ismodapi(username, channel)) { // Wenn Mod nach der API Funktion weitergabe mit dem Modlevel aus der Config
                            nextcode(activebots["users"][channel].modlevel);
                        } else {
                            if (issubapi(username, channel)) { // Wenn Mod nach der API Funktion weitergabe mit dem Modlevel aus der Config
                                nextcode(activebots["users"][channel].sublevel);
                            } else {
                                if (activebots["users"][channel]["cache"][username] == undefined) { // Wenn nichts im Username Cache SQL Starten!
                                    util.log("SQL GETTING");
                                    sqlconnection.query("SELECT userlevel FROM users WHERE (channel=\"" + channel + "\" OR channel=\"global\") AND username=\"" + username + "\";", function(err, results) { //SQL STARTU! SwiftRage
                                        if (!err) { // Errorabfrage
                                            if (results[0] == undefined) { // Kein Userlevel explizit vorgelegt, fallback auf Mod oder nicht mod
                                                if (ismodapi(username, channel)) { // Wenn Mod rückgabe von Modlevel auf Cache, sonst Regularlevel
                                                    var usrlevel = activebots["users"][channel].modlevel;
                                                } else {
                                                    var usrlevel = activebots["users"][channel].regularlevel;
                                                }

                                            } else {
                                                var usrlevel = results[0]["userlevel"]; // Was gefunden? Rückgabe, überschreibt Modstatus und Regularstatus, aber keinen Status von Streamer!
                                            }
                                            activebots["users"][channel]["cache"][username] = usrlevel; // Gefundenes Userlevel in Cache schreiben
                                            nextcode(usrlevel); // Weitergabe an Callback
                                        } else {
                                            // TODO: Add SQL Error Handling

                                        }
                                    });
                                } else {
                                    // Username in Cache gefunden! Einfache Rückgabe mit cache Wert
                                    util.log("CACHE GETTING");
                                    nextcode(activebots["users"][channel]["cache"][username]);
                                }
                            }
                        }
                    } else {
                        // Nutzer ist Streamer! Rückabe von 5!
                        nextcode(5);
                    }

                }
            } else {
                // Fallback Nutzersystem für WhatsApp Backend, Rückabe von Userlevel 999
                nextcode(999);
            }
        }

        function refreshbotconfig(channel) { //Erstellt lokalen Cache von Konfiguration im RAM neu
            refreshbotcommands(channel); // Anstoßen von Command Refresh
            refreshbotusers(channel); // Refresh von Festen Nutzerleveln
            // SQL Config auslesen. Kein SELECT * verwendet da es bei Peaks einen kleinen Performancevorteil bietet
            sqlconnection.query("SELECT linkfilter, quotes, blacklistfilter, linktolength, blacklisttolength, linktotext, blacklisttotext, maxtoul, silentto, silentlinkto, silentblacklistto, id FROM botconfig WHERE channel=" + mysql.escape(channel) + ";", function(err, results) {
                if (err == null) {
                    // Results aus SQL übertragen in Lokalen Variablen Cache. Yaay 300000 gleiche Zeilen (._.
                    activebots["config"][channel] = {};
                    activebots["config"][channel].linkfilter = (results[0].linkfilter == "0") ? false : true;
                    activebots["config"][channel].blacklistfilter = (results[0].blacklistfilter == "0") ? false : true;
                    activebots["config"][channel].linktolength = results[0].linktolength;
                    activebots["config"][channel].linktotext = results[0].linktotext;
                    activebots["config"][channel].blacklisttotext = results[0].blacklisttotext;
                    activebots["config"][channel].blacklisttolength = results[0].blacklisttolength;
                    activebots["config"][channel].maxtoul = results[0].maxtoul;
                    activebots["config"][channel].silentto = (results[0].silentto == "0") ? false : true;
                    activebots["config"][channel].silentlinkto = (results[0].silentlinkto == "0") ? false : true;
                    activebots["config"][channel].silentblacklistto = (results[0].silentblacklistto == "0") ? false : true;
                    activebots["config"][channel].permit = "";
                    activebots["config"][channel].id = results[0].id;
                    activebots["config"][channel].quotelevel = results[0].minquoteuserlevel;
                    activebots["config"][channel].quoteswitch = (results[0].quotes == "0") ? false : true;
                    activitytimer[channel] = 0;
                }
            });
            // Linkwhitelist in den Cache schreiben für Linkfilter
            sqlconnection.query("SELECT link FROM linkwhitelist WHERE channel=" + mysql.escape(channel) + " OR channel=" + mysql.escape("global") + ";", function(err, results) {
                if (err == null) {
                    activebots["config"][channel].linkwhitelist = results;
                } else {
                    activebots["config"][channel].linkwhitelist = [];
                }
            });
            // Viel schmutzige Wörter in den RAM Schreiben damit man nicht immer in die Kiste greifen muss
            sqlconnection.query("SELECT word FROM wordblacklist WHERE channel=" + mysql.escape(channel) + ";", function(err, results) {
                if (err == null) {
                    activebots["config"][channel].blacklistwords = results;
                } else {
                    activebots["config"][channel].blacklistwords = [];
                }
            });
        }

        function refreshbotusers(channel) {
            // Liest Festgelegete Nutzer und Level in den Cache ein
            var sql = "SELECT useuserapi, modlevel, regularlevel, sublevel, editoroauth FROM botconfig WHERE channel='" + channel + "';";
            sqlconnection.query(sql, function(err, results) {
                activebots["users"][channel] = {
                    modlevel: results[0].modlevel,
                    regularlevel: results[0].regularlevel,
                    sublevel: results[0].sublevel,
                    useapi: results[0].useuserapi,
                    mods: [],
                    subs: [],
                    cache: []
                };
                if (activebots["users"][channel].useapi == "1") {
                    util.log("Using TMI List for Channel " + channel);
                    client.say(channel, "/mods")
                } else {
                    util.log("NO API");
                }
                util.log("Requesting Subscribers for " + channel);
                request({
                    url: 'https://api.twitch.tv/kraken/channels/' + channel.substr(1, channel.length) + '/subscriptions',
                    headers: {
                        'Accept': 'application/vnd.twitchtv.v3+json',
                        'Authorization': 'OAuth ' + results[0].editoroauth
                    }

                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                        var firstbatch = JSON.parse(body);
                        firstbatch["subscriptions"].forEach(function(current) {
                            activebots["users"][channel]["subs"].push(current["user"]["name"]);
                        });
                        for (i = 25; i < firstbatch["_total"]; i = i + 25) {
                            request({
                                url: 'https://api.twitch.tv/kraken/channels/' + channel.substr(1, channel.length) + '/subscriptions?offset=' + i,
                                headers: {
                                    'Accept': 'application/vnd.twitchtv.v3+json',
                                    'Authorization': 'OAuth ' + results[0].editoroauth
                                }

                            }, function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    var nextbatch = JSON.parse(body);
                                    nextbatch["subscriptions"].forEach(function(current) {
                                        activebots["users"][channel]["subs"].push(current["user"]["name"]);
                                    });
                                }
                                console.log("Read subs: " + activebots["users"][channel]["subs"])

                            })
                        }
                    } else {
                        console.log("HTTP ERROR: " + error + "  " + response.statusCode + " " + body + " CHANNEL CHANNEL CHANNEL CHANNEL CHANNEL CHANNEL " + channel);
                    }

                })
            })
        }

        function refreshbotcommands(channel) {
            var sql = 'SELECT userlevel, text, channel, commandname FROM commands WHERE channel="' + channel + '";';
            sqlconnection.query(sql, function(err, results) {
                if (err == null) {
                    if (results[0] !== undefined) {
                        activebots["commands"][channel] = results;

                    }
                } else {
                    console.log("SQL ERROR: " + err);
                }
            })
        }

        var awschannel = [];
        // Starts channel join
        function join(channel) {
            util.log("Start: Joining Channel: " + channel);
            sqlconnection.query("SELECT id, ircusername, ircoauthtoken FROM botconfig WHERE channel='" + channel + "';", function(err, results) {
                var ircconfig = results;
                if (activebots["config"][channel] == undefined) {
                    util.log("Start join, channel not active");
                    if (results[0] == undefined) {
                        util.log("Channel not existant");
                        var sql = "INSERT INTO  `kirschnbot`.`botconfig` (`id` , `channel` , `isactive`) VALUES ( NULL ,  '" + channel + "' , 'true' );";
                        sqlconnection.query(sql, function(err, results) {
                            if (err == null) {
                                //join complete
                                refreshbotconfig(channel);
                                setTimeout(function() {
                                    request("http://tmi.twitch.tv/servers?channel=" + channel.substr(1, channel.length), function(err, response, body) {
                                        if (!err && response.statusCode == 200) {
                                            if (JSON.parse(body)["cluster"] == "aws") {
                                                util.log(channel + ": AWS Cluster");
                                                awschannel.push(channel);
                                                clientaws.join(channel);
                                            } else {
                                                util.log(channel + ": Main Cluster");
                                                client.join(channel);
                                            }
                                        }
                                    });

                                }, 900);
                                util.log("Bot Database Build: " + results);
                            } else {
                                util.log("Error while building Bot Database: " + err);
                            }
                        });
                    } else {
                        var sql = 'UPDATE botconfig SET isactive=\'true\' WHERE channel=\'' + channel + '\';',
                            botid = results[0]['id'];
                        sqlconnection.query(sql, function(err, results) {
                            util.log("Global Channel ID: " + botid);

                            console.log(ircconfig);
                            console.log("IRC username: |" + ircconfig[0].ircusername + "| Botusername: |" + botusername + "|");
                            if (String(ircconfig[0].ircusername) == String(botusername)) {
                                util.log("Joining as current client");
                                activebots["config"][channel] = {
                                    id: botid
                                };
                                refreshbotconfig(channel);
                                setTimeout(function() {
                                    request("http://tmi.twitch.tv/servers?channel=" + channel.substr(1, channel.length), function(err, response, body) {
                                        if (!err && response.statusCode == 200) {
                                            if (JSON.parse(body)["cluster"] == "aws") {
                                                util.log(channel + ": AWS Cluster");
                                                clientaws.join(channel);
                                            } else {
                                                util.log(channel + ": Main Cluster");
                                                client.join(channel);
                                            }
                                        }
                                    });
                                }, 900);
                            } else {
                                util.log("IRC Username for Channel not the same, writing Task to other instance and/or building one");
                                var sql = 'INSERT INTO bottodo (type, channel, chatbot, initby) VALUES ("join", ' + mysql.escape(channel) + ', ' + mysql.escape(ircconfig[0].ircusername) + ', ' + mysql.escape("instancehandler") + ');';
                                console.log("Executing SQL: " + sql)
                                sqlconnection.query(sql, function(err, results) {
                                    if (err !== null) {
                                        console.log("SQL ERROR: " + err);
                                    }
                                });
                                var sqldel = 'DELETE FROM bottodo WHERE chatbot=' + mysql.escape(ircconfig[0].ircusername) + ' AND type=\'reinit\';';
                                sqlconnection.query(sqldel);
                                if (activebotprocessnames.indexOf(ircconfig[0].ircusername) == -1) {
                                    util.log("Building new Bot Instance");
                                    activebotprocessnames.push(ircconfig[0].ircusername);
                                    subprocesses[ircconfig[0].ircusername] = spawn("bash");
                                    setTimeout(function() {
                                        console.log("Writing IRC Credentials");
                                        subprocesses[ircconfig[0].ircusername].stdin.write("youare||" + ircconfig[0].ircusername + "||" + ircconfig[0].ircoauthtoken + "||\n");
                                    }, 500);
                                    subprocesses[ircconfig[0].ircusername].stdout.on('data', function(data) {
                                        console.log("STDOUT FORK " + ircconfig[0].ircusername + ": " + data)
                                    });
                                    subprocesses[ircconfig[0].ircusername].stderr.on('data', function(data) {});
                                    subprocesses[ircconfig[0].ircusername].on('exit', function(data) {});
                                    subprocesses[ircconfig[0].ircusername].stdin.write("node bot.js\n");


                                }
                            }
                        });

                    }
                } else {
                    util.log("Join stopped, channel already active");
                }
            })

        }

        function leave(channel) {
            if (sysconf.modchan.indexOf(channel) !== -1) {
                return "Modchannel";
            } else {
                if (activebots["config"][channel] !== undefined) {
                    var sql = 'UPDATE botconfig SET isactive=NULL WHERE channel=\'' + channel + '\';';
                    sqlconnection.query(sql, function(err, results) {
                        if (err == null) {
                            if (awschannel.indexOf(channel) !== -1) {
                                clientaws.part(channel);
                            } else {
                                client.part(channel);
                            }
                            activebots["config"][channel] = undefined;
                        } else {
                            console.log(err);
                        }
                    });
                }
                activebots["config"][channel] = undefined;
            }
        }

        function addcommand(commandname, text, userlevel, channel, creator, callback) {
            var date = new Date();
            var sql = 'INSERT INTO commands (commandname, text, userlevel, channel, creator, createtime) VALUES (' + sqlconnection.escape(commandname) + ', ' + sqlconnection.escape(text) + ' , ' + sqlconnection.escape(userlevel) + ', ' + sqlconnection.escape(text) + sqlconnection.escape(creator) + ', ' + date.toJSON() + ');';
            sqlconnection.query(sql, function(err, results) {
                if (err == null) {
                    util.log("Added Command: " + sqlconnection.escape(commandname));
                    callback();
                } else {
                    console.log(err);
                }
            });
        }

        function builddatafrombotold(channel) {
            var commands = fs.readdirSync("/home/nodejs/nodescripts/produktivumgebung/bots/" + channel + "/commands");
            commands.forEach(function(current) {
                if (fs.existsSync("/home/nodejs/nodescripts/produktivumgebung/bots/" + channel + "/commands/" + current + "/text") && fs.existsSync("/home/nodejs/nodescripts/produktivumgebung/bots/" + channel + "/commands/" + current + "/userlevel")) {
                    var date = new Date();
                    var sql = 'INSERT INTO commands (commandname, text, userlevel, channel, creator, createtime) VALUES (' + sqlconnection.escape(current) + ', ' + sqlconnection.escape(fs.readFileSync("/home/nodejs/nodescripts/produktivumgebung/bots/" + channel + "/commands/" + current + "/text")) + ' , ' + sqlconnection.escape(fs.readFileSync("/home/nodejs/nodescripts/produktivumgebung/bots/" + channel + "/commands/" + current + "/userlevel", "utf-8").replace("6", "999").replace("4", "100").replace("2", "5").replace("5", "500")) + ', ' + sqlconnection.escape("#" + channel) + ", " + sqlconnection.escape("?") + ', ' + sqlconnection.escape(date.toJSON()) + ');';
                    sqlconnection.query(sql, function(err) {
                        if (err !== null) {
                            console.log(err)
                        } else {
                            console.log("Command " + current + "@" + channel + " eingetragen");
                        }
                    })
                }
            });


        }

        function builddatafromoldquotebot(channel) {
            var commands = fs.readdirSync("/root/kbot2/xoviquote/commands");
            commands.forEach(function(current) {
                if (fs.existsSync("/root/kbot2/xoviquote/commands/" + current + "/text")) {
                    var sql = 'INSERT INTO quotes (name, text, channel) VALUES (' + sqlconnection.escape(current) + ', ' + sqlconnection.escape(fs.readFileSync("/root/kbot2/xoviquote/commands/" + current + "/text", "utf8")).replace("Ã¤", "ä").replace("Ã¼", "ü").replace("Ã¶", "ö") + ', "#xovigin");';
                    sqlconnection.query(sql, function(err) {
                        if (err !== null) {
                            console.log(err)
                        } else {
                            console.log("Zitat " + current + "@" + channel + " eingetragen");
                        }
                    })
                }
            });


        }

        function createstrawpoll(pollname, answers, callback) {
            var stream = strawpoll({
                    title: pollname,
                    options: answers,
                    multi: false,
                    permissive: true
                })
                .pipe(JSONStream.parse('id'))
                .pipe(concat(function(id) {
                    // `id` is a Buffer here
                    // `id.toString()` is your poll's id
                    callback(id.toString());
                }));
        }

        if (ismaster && !gotcredfromstdin && botusername == "kirschnbot") {
            setTimeout(function() {
                var sql = "SELECT channel FROM botconfig WHERE isactive=\"true\";";
                sqlconnection.query(sql, function(err, results) {
                    if (!err) {
                        results.forEach(function(current) {
                            console.log("JOINING: " + current.channel);
                            join(current.channel);

                        });
                    } else {
                        console.log(err);
                    }
                });
            }, 2000);
        }

        function getrandomlistfromitem(listname, channel) {
            var sql = "SELECT item FROM useritems WHERE list=" + mysql.escape(listname) + ", channel=" + mysql.escape(channel) + " ORDER BY RAND() LIMIT 1;";
            sqlconnection.query(sql, function(results) {
                if (results[0] !== undefined) {

                }
            });
        }

        // Startet Timer im RAM
        function starttimer(channel, text, interval, name) {
            if (timer[channel] == undefined) {
                timer[channel] = [];
            }
            timer[channel][name] = setInterval(function() {
                client.say(channel, text);
            }, interval * 1000);
        }

        // Stoppt Timer im RAM
        function stoptimer(channel, name) {
            clearInterval(timer[channel][name]);
        }

        // Erstellt neuen Timer in der Datenbank
        function createtimer(channel, text, interval, name, active) {
            var sql = "INSERT INTO timer (text, name, timerinterval, channel, active) VALUES (" + mysql.escape(text) + ", " + mysql.escape(name) + ", " + mysql.escape(interval) + ", " + mysql.escape(channel) + ", " + mysql.parse(active) + ");"
            sqlconnection.query(sql);
            if (active) {
                starttimer(channel, text, interval, name);
            }
        }

        function loadandstarttimer(channel, name) {
            var sql = "SELECT text, timerinterval FROM timer WHERE channel=" + mysql.escape(channel) + " AND name=" + mysql.escape(name) + ";";
            sqlconnection.query(sql, function(err, results) {
                if (results[0] !== undefined) {
                    starttimer(channel, results[0].text, results[0].timerinterval, name);
                    client.say(channel, "Timer " + name + " started successfully (Interval: " + results[0].timerinterval + " minutes");
                } else {
                    // TImer existiert nicht
                }
            })
        }

        function handlecommand(handlemessage, channel, callback, username, triggercommand) {
            util.log("Looping " + ((handlemessage.match(/\$/g) || []).length + 1) + " Times");
            var handlesplit = handlemessage.split(" ");
            var splittrigger = triggercommand.split(" ");
            for (i = 0; i < ((handlemessage.match(/\$/g) || []).length + 1); i++) {
                splittrigger = triggercommand.split(" ");
                if (handlemessage.indexOf("$qelseuser") !== -1) {
                    var query = triggercommand.replace(splittrigger[0], "");
                    console.log("Handlemessage: " + handlemessage);
                    console.log("Triggercommand: " + triggercommand);
                    util.log("Replacing $queryelseuser with " + query);
                    if (splittrigger[1] !== undefined) {
                        handlemessage = handlemessage.replace("$qelseuser", query);
                    } else {
                        handlemessage = handlemessage.replace("$qelseuser", username);
                    }
                }
            }
            handlesplit.forEach(function(current) {
                if (current.indexOf("]elseuser") > current.indexOf("$[")) {
                    var triggercommandwordindex = parseInt(current.replace("$[", "").replace("]elseuser", ""));
                    if (splittrigger[triggercommandwordindex] !== undefined) {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elseuser", splittrigger[triggercommandwordindex]);
                    } else {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elseuser", username);
                    }
                }

                if (current.indexOf("$[") < current.indexOf("]elserngnumber(") && current.indexOf("]elserngnumber(") < current.indexOf(",") && current.indexOf(",") < current.indexOf(")")) {
                    util.log("Found RNG Number Parsing in word " + current);
                    var triggercommandwordindex = parseInt(current.replace("$[", "").split("]else")[0]);
                    var rngstring = current.replace("$[" + triggercommandwordindex + "]elserngnumber(", "").replace(")", "");
                    var splitrngstring = rngstring.split(",");
                    var min = parseInt(splitrngstring[0]);
                    var max = parseInt(splitrngstring[1]);
                    if (splittrigger[triggercommandwordindex] !== undefined) {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elserngnumber(" + min + "," + max + ")", splittrigger[triggercommandwordindex]);
                    } else {
                        if (parseInt(splitrngstring[0]) < parseInt(splitrngstring[1])) {
                            var random = Math.round(Math.random() * (max - min)) + min;
                            util.log("RNG String: " + rngstring + " | min: " + min + " | max: " + max + " | RNG: " + random);
                            handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elserngnumber(" + min + "," + max + ")", random);
                        }
                    }
                }
                if (current.indexOf("$[") < current.indexOf("]elserngitem(") && current.indexOf("]elserngitem(") < current.indexOf(")")) {
                    util.log("Found RNG List Parsing in word " + current);
                    var triggercommandwordindex = parseInt(current.replace("$[", "").split("]else")[0]);
                    var rngstring = current.replace("$[" + triggercommandwordindex + "]elserngitem(", "").replace(")", "");
                    if (splittrigger[triggercommandwordindex] !== undefined) {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elserngitem(" + rngstring + ")", splittrigger[triggercommandwordindex]);
                    } else {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elserngitem(" + rngstring + ")", "$[rnglist(" + rngstring + ")]");

                    }
                }
                if (current.indexOf("$[") < current.indexOf("]elsetext(") && current.indexOf("]elsetext(") < current.indexOf(")")) {
                    util.log("Found Text Parsing in word " + current);
                    var triggercommandwordindex = parseInt(current.replace("$[", "").split("]else")[0]);
                    var rngstring = current.replace("$[" + triggercommandwordindex + "]elserngitem(", "").replace(")", "");
                    if (splittrigger[triggercommandwordindex] !== undefined) {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elsetext(" + rngstring + ")", splittrigger[triggercommandwordindex]);
                    } else {
                        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]elsetext(" + rngstring + ")", "rngstring");

                    }
                }
                if (current.indexOf("$rngnumber(") < current.indexOf(",") && current.indexOf(",") < current.indexOf(")")) {
                    util.log("Found RNG Number Parsing in word " + current);
                    var rngstring = current.replace("$rngnumber(", "").replace(")", "");
                    var splitrngstring = rngstring.split(",");
                    var min = parseInt(splitrngstring[0]);
                    var max = parseInt(splitrngstring[1]);
                    if (parseInt(splitrngstring[0]) < parseInt(splitrngstring[1])) {
                        var random = Math.round(Math.random() * (max - min)) + min;
                        util.log("RNG String: " + rngstring + " | min: " + min + " | max: " + max + " | RNG: " + random);
                        handlemessage = handlemessage.replace("$rngnumber(" + min + "," + max + ")", random);
                    }

                }

                //TODO: Definiertes Item else RNG Item
                // Unten Syntax für Defines RNG Itemnamen angeben, Hier das Else Statement mit dem entsprechenden Syntax  ersetzen


                //if (current.indexOf("]") > current.indexOf("$[")) {
                //    var triggercommandwordindex = parseInt(current.replace("$[", "").replace("]", ""));
                //   if (splittrigger[triggercommandwordindex] !== undefined) {
                //        handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]", splittrigger[triggercommandwordindex]);
                //1   } else {
                //      handlemessage = handlemessage.replace("$[" + triggercommandwordindex + "]", "");
                //  }
                //}
            });

            util.log("Preextraparse Ok, current Handlemessage: " + handlemessage + " (triggercommand: " + triggercommand + ") Loop " + i);


            if (handlemessage.replace("$[", "") !== handlemessage) {
                util.log("Parsing extra command parameters");
                var othercommand = handlemessage.split("$[");
                var current = othercommand[1];
                if (current.indexOf("]" !== -1)) {
                    current = current.split("]");
                    if (current[0] !== undefined || current[0] !== "" || current[0] !== " ") {

                        if (current[0].indexOf("counter(") !== -1) {
                            // var countername = String(current[0].split(")")).replace("counter(", "").replace(",", "");
                            // addcounter(countername.replace("counter(", ""));
                            // console.log("[BOT " + CHANNEL + "]: " +fs.readFileSync("counter/" + countername + ".txt"));
                            // fs.readFile("counter/" + countername.toLowerCase() + ".txt", function (err, data) {
                            //    handlemessage = handlemessage.replace("$[counter(" + countername + ")]", data);
                            //    client.say(channel, handlemessage);
                            // });


                        } else if (current[0].indexOf("rnglist(") !== -1) {
                            var listname = String(current[0].split(")")).replace("rnglist(", "").replace(",", "");
                            var sql = "SELECT item FROM useritems WHERE list=" + mysql.escape(listname) + " AND (channel=" + mysql.escape(channel) + " OR channel=\"global\") ORDER BY RAND() LIMIT 1;";
                            sqlconnection.query(sql, function(err, results) {
                                if (results[0] !== undefined) {
                                    callback(handlemessage.replace("$[rnglist(" + listname + ")]", results[0]["item"]));
                                } else {
                                    callback(handlemessage.replace("$[rnglist(" + listname + ")]", "[empty or invalid list]"));
                                }
                            });


                        } else if (current[0].indexOf("http(") !== -1) {
                            var url = String(current[0].split(")")[0]).replace("http(", "").replace(",", "");
                            if (url.length < 500) {
                                request(url, function(error, response, body) {
                                    console.log("Error: " + error + " Response: " + response + " Body: " + body);
                                    if (body == undefined) {
                                        callback(handlemessage.replace(url, "Invalid Syntax"));
                                    } else {
                                        if (!error && response.statusCode == 200) {
                                            console.log("HTTP Request ok")
                                        } else {
                                            body = "HTTP: " + response.statusCode;
                                        }
                                        handlemessage = handlemessage.replace("$[http(" + url + ")]", String(body).substr(0, 400).replace(/\n|\r/g, ""));
                                        callback(handlemessage);
                                    }
                                })

                            }


                        } else {
                            callback(handlemessage);
                        }

                    }
                } else {
                    //Syntaxfehler
                }


            } else {
                util.log("No more Params, starting callback function");
                callback(handlemessage);
            }

        }

        client.on('motd', function(motd) {
            util.log("MOTD: " + motd);
        });


        client.on('join', function(channel, nick, message) {
            util.log("JOIN: " + channel + " : " + nick + " : " + message);
        });

        client.addListener('pm', function(from, message) {
            util.log(from + ' => Bot: ' + message);
        });
        client.on('raw', function(message) {
            console.log(message);
            if (message.args[1] == "Error logging in" && message.command == "NOTICE") {
                mail({
                        from: 'kirschnbotservice@kirschn.de',
                        to: 'support@kirschn.de',
                        subject: 'KIRSCHNBOT HIGH LEVEL ISSUE: Account Management failure',
                        content: 'Error logging in: ' + botusername + '@irc.twitch.tv:6667'
                    },
                    function(err, response) {
                        if (err) {
                            console.log(err);
                        }
                        console.dir(response);
                        process.exit();
                    });

            } else if ((message.args[1] !== undefined) && message.command == "NOTICE") {
                if (message.args[1].replace("The moderators of this room are: ", "") !== message.args[1]) {
                    // Da kommt ne Modliste! \o/
                    // Kein Array, daher erst parsen
                    activebots["users"][message.args[0]]["mods"] = message.args[1].replace("The moderators of this room are: ", "").split(", ");
                    util.log("Got Modlist from TMI: " + activebots["users"][message.args[0]]["mods"])
                }


            }
        });
        client.on('error', function(message) {
            console.log("ERROR: " + message.nick + " -> " + message.command + "(" + message.args + ")");
        });
        clientaws.on('motd', function(motd) {
            util.log("AWS MOTD: " + motd);
        });


        clientaws.on('join', function(channel, nick, message) {
            util.log("AWS JOIN: " + channel + " : " + nick + " : " + message);
        });

        clientaws.addListener('pm', function(from, message) {
            util.log(from + ' => AWS Bot: ' + message);
        });
        clientaws.on('raw', function(message) {
            if (message.args[1] == "Error logging in" && message.command == "NOTICE") {
                mail({
                        from: 'kirschnbotservice@kirschn.de',
                        to: 'support@kirschn.de',
                        subject: 'KIRSCHNBOT HIGH LEVEL ISSUE: Account Management failure',
                        content: 'Error logging in: ' + botusername + '@irc.twitch.tv:6667'
                    },
                    function(err, response) {
                        if (err) {
                            console.log(err);
                        }
                        console.dir(response);
                        process.exit();
                    });

            }
        });
        clientaws.on('error', function(message) {
            console.log("AWS ERROR: " + message.nick + " -> " + message.command + "(" + message.args + ")");
        });

        function thischanmodlevel(channel) {
            if (activebots["users"][channel] !== undefined) {
                return activebots["users"][channel].modlevel;
            } else {
                return 999;
            }

        }

        function parsecom(nick, channel, text, funcret, tos) {
            util.log("MESSAGE " + channel + " => " + nick + " => " + text);
            console.log(activitytimer);
            activitytimer[channel] += 1;
            console.log(activitytimer);
            if (activebots["config"][channel] !== undefined && tos && !friendlymode) {
                if (activebots["config"][channel].linkfilter) {
                    if (linkregex.test(text.toLowerCase())) {
                        util.log("Found Link in Message from " + nick);
                        getuserlevel(nick, channel, function(ul) {
                            util.log("Initalizing Timeout for Message from " + nick + "(UL: " + ul + ")");
                            if (activebots["config"][channel].permit !== nick) {
                                if (ul >= activebots["config"][channel].maxtoul && !ismodapi(nick, channel)) {
                                    var timeout = true;
                                    activebots["config"][channel].linkwhitelist.forEach(function(current) {
                                        if (text.indexOf(current.link) !== -1) {
                                            timeout = false;
                                        }
                                    });
                                    if (timeout) {
                                        funcret(channel, ".timeout " + nick + " " + activebots["config"][channel].linktolength);
                                        if (!activebots["config"][channel].silentto && !activebots["config"][channel].silentlinkto) {
                                            setTimeout(function() {
                                                funcret(channel, nick + " -> " + activebots["config"][channel].linktotext);
                                            }, 500);
                                            setTimeout(function() {
                                                funcret(channel, ".timeout " + nick + " " + activebots["config"][channel].linktolength);
                                            }, 1000);
                                        }
                                    }
                                }
                            } else {
                                activebots["config"][channel].permit = "";
                            }
                        });


                    }
                }
                if (activebots["config"][channel].blacklistfilter) {
                    var textlowercase = text.toLowerCase();
                    activebots["config"][channel].blacklistwords.forEach(function(current) {
                        if (textlowercase.indexOf(current.word) !== -1) {
                            getuserlevel(nick, channel, function(ul) {
                                if (ul >= activebots["config"][channel].maxtoul) {
                                    funcret(channel, ".timeout " + nick + " " + activebots["config"][channel].blacklisttolength);
                                    setTimeout(function() {
                                        funcret(channel, ".timeout " + nick + " " + activebots["config"][channel].blacklisttolength);
                                    }, 1000);
                                    if ((!activebots["config"][channel].silentto) && (!activebots["config"][channel].silentblacklistto)) {
                                        setTimeout(function() {
                                            funcret(channel, nick + " -> " + activebots["config"][channel].blacklisttotext);
                                        }, 500);

                                    }
                                }
                            });
                        }
                    })
                }
            } else {

            }
            console.time("commandexec");
            console.time("usercommandexec");
            if (text[0] == "!") {
                var splitmessagelowercase = text.toLowerCase().split(" ");
                var splitmessagenormal = text.split(" ");
                sqlconnection.query('SELECT userlevel, text, whispercommand FROM commands WHERE channel="' + channel + '" AND commandname="' + splitmessagelowercase[0].replace(/'/g, "") + '" ;', function(err, results) {
                    if (results[0] !== undefined && (lockedcommands[channel + splitmessagelowercase[0]] == false || lockedcommands[channel + splitmessagelowercase[0]] == undefined)) {
                        getuserlevel(nick, channel, function(usrlevel) {
                            if (results[0].userlevel >= usrlevel) {
                                // PARAMETER HANDLEN
                                handlecommand(results[0].text, channel, function(callback) {
                                    if (results[0].whispercommand) {
                                        whisper(nick, String(callback).replace("$username", nick)
                                            .replace("$query", text.replace(splitmessagenormal[0] + " ", ""))
                                            .replace("$user", nick));
                                    } else {
                                        funcret(channel, String(callback).replace("$username", nick)
                                            .replace("$query", text.replace(splitmessagenormal[0] + " ", ""))
                                            .replace("$user", nick));
                                    }
                                    lockedcommands[channel + splitmessagelowercase[0]] = true;
                                    setTimeout(function() {
                                        lockedcommands[channel + splitmessagelowercase[0]] = false;
                                    }, 10000);

                                    console.timeEnd("usercommandexec");
                                }, nick, text);

                            }
                        });
                    }
                });

                // GLOBAL COMMANDS

                if (splitmessagelowercase[0] == "!botinfo") {

                    funcret(channel, "KirschnBot V2.3.0.0 | Global Bot ID: " + ((activebots["config"][channel] == undefined) ? "WABOT" : activebots["config"][channel]["id"]));
                } else if (splitmessagelowercase[0] == "!getuserlevel") {
                    getuserlevel(splitmessagelowercase[1], channel, function(usrlevel) {
                        funcret(channel, nick + " -> " + usrlevel);
                    });

                }
                if (splitmessagelowercase[0] == "!dumpvar" && isglobaladmin(nick)) {
                    funcret(channel, eval(String(text).replace("!dumpvar ", "")));
                }
                if (splitmessagelowercase[0] == "!friendly" && isglobaladmin(nick)) {
                    friendlymode = !friendlymode;
                    if (friendlymode) {
                        funcret(channel, "Enabled global Friendly Mode for instance " + botusername);
                    } else {
                        funcret(channel, "Disabled global Friendly Mode for instance " + botusername);
                    }

                }
                //MODCOMMANDS
                if (splitmessagelowercase[0] == "!leave" || splitmessagelowercase[0] == "!kbotleave") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            funcret(channel, nick + " -> Leaving Channel");
                            leave(channel);
                        }
                    });
                }
                if (splitmessagelowercase[0] == "!additem" && splitmessagelowercase[1] !== undefined && splitmessagelowercase[2] !== undefined) {
                    if (splitmessagelowercase[2].indexOf("-name=") !== -1) {
                        var itemname = splitmessagenormal.split("=")[1];
                        var sql = "INSERT INTO  `kirschnbot`.`useritems` (`id` , `channel` , `item` , `list` , `itemname` ) VALUES ( NULL , " + mysql.escape(channel) + ",  " + mysql.escape(text.replace("!additem " + splitmessagenormal[1] + " " + splitmessagenormal[2] + " ", "")) + ",  " + mysql.escape(splitmessagelowercase[1]) + ",  " + mysql.escape(itemname) + ");";
                    } else {
                        var sql = "INSERT INTO  `kirschnbot`.`useritems` (`id` , `channel` , `item` , `list` , `itemname` ) VALUES ( NULL , " + mysql.escape(channel) + ",  " + mysql.escape(text.replace("!additem " + splitmessagenormal[1] + " ", "")) + ",  " + mysql.escape(splitmessagelowercase[1]) + ",  '');";
                    }
                    console.log(sql);
                    sqlconnection.query(sql, function(err, results) {
                        if (err == null) {
                            funcret(channel, nick + " -> Item added");
                        }
                    });
                }
                if (splitmessagelowercase[0] == "!removeitem" && splitmessagelowercase[1] !== undefined && splitmessagelowercase[2] !== undefined) {
                    if (splitmessagelowercase[2].indexOf("-name=") !== -1) {
                        var itemname = splitmessagenormal.split("=")[1];
                        var sql = "INSERT INTO  `kirschnbot`.`useritems` (`id` , `channel` , `item` , `list` , `itemname` ) VALUES ( NULL , " + mysql.escape(channel) + ",  " + mysql.escape(splitmessagenormal[3]) + ",  '" + mysql.escape(splitmessagelowercase[1]) + "',  'datfrankerz');";
                    } else {
                        var sql = "INSERT INTO  `kirschnbot`.`useritems` (`id` , `channel` , `item` , `list` , `itemname` ) VALUES ( NULL , " + mysql.escape(channel) + ",  " + mysql.escape(text.replace("!additem " + splitmessagenormal[1] + " ", "")) + ",  '" + mysql.escape(splitmessagelowercase[1]) + "',  'datfrankerz');";
                    }
                    sqlconnection.query(sql, function(err, results) {
                        if (err == null) {
                            funcret(channel, nick + " -> Item added");
                        }
                    });
                }
                if ((splitmessagelowercase[0] == "!zitat" || splitmessagelowercase[0] == "!quote") && activebots["config"][channel].quoteswitch) {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= activebots["config"][channel].quotelevel) {
                            if (splitmessagelowercase[1] !== undefined) {
                                // Zitatsname ist Wort 1!
                                var sql = "SELECT text FROM quotes WHERE name=" + mysql.escape(splitmessagelowercase[1]) + " AND (channel=" + mysql.escape(channel) + " OR channel=\"global\") ORDER BY RAND() LIMIT 1;";
                            } else {
                                var sql = "SELECT text FROM quotes WHERE (channel=" + mysql.escape(channel) + " OR channel=\"global\") ORDER BY RAND() LIMIT 1;";
                            }
                            sqlconnection.query(sql, function(err, results) {
                                if (results[0] !== undefined) {
                                    funcret(channel, results[0]["text"])
                                } else {
                                    funcret(channel, "Quote does not exist");
                                }
                            });
                        }

                    });

                }
                if (splitmessagelowercase[0] == "!addquote" && splitmessagelowercase[1] !== undefined && splitmessagelowercase[2] !== undefined) {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            var sql = "SELECT text FROM quotes WHERE name=" + mysql.escape(splitmessagelowercase[1]) + " AND (channel=" + mysql.escape(channel) + " OR channel=\"global\") ORDER BY RAND() LIMIT 1;";
                            sqlconnection.query(sql, function(err, results) {
                                if (err == null) {
                                    if (results[0] === undefined) {
                                        var sql = "INSERT INTO  `kirschnbot`.`quotes` (`id` , `channel` , `name` , `text` , `username`) VALUES ( NULL , " + mysql.escape(channel) + ",  " + mysql.escape(splitmessagelowercase[1]) + ",  " + mysql.escape(text.replace(splitmessagenormal[0] + " " + splitmessagenormal[1] + " ", " ")) + ", " + mysql.escape(nick) + ");";
                                        console.log(sql);
                                        sqlconnection.query(sql, function(err, results) {
                                            if (err == null) {
                                                funcret(channel, nick + " -> Quote added");
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    } else {
                                        funcret(channel, "A quote with this ID already exists");
                                    }
                                } else {
                                    console.log(err);
                                }
                            })
                        }
                    });
                }
                if ((splitmessagelowercase[0] == "!deletequote" || splitmessagelowercase[0] == "!removequote" || splitmessagelowercase[0] == "!delquote") && splitmessagelowercase[1] !== undefined) {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            var sql = "DELETE FROM quotes WHERE name=" + mysql.escape(splitmessagelowercase[1]) + ";";
                            console.log(sql);
                            sqlconnection.query(sql, function(err, results) {
                                if (err == null) {
                                    funcret(channel, nick + " -> Quote removed");
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
                if (splitmessagelowercase[0] == "!strawpoll") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            if (splitmessagenormal[3] !== undefined) {
                                var answers = text.replace(splitmessagenormal[0] + " " + splitmessagenormal[1] + " ", "").split(" ");
                                console.log(answers);
                                createstrawpoll(splitmessagenormal[1], answers, function(id) {
                                    funcret(channel, nick + " -> Poll \"" + splitmessagenormal[1] + "\" created: http://strawpoll.me/" + id);
                                })
                            }
                        }
                    })
                }
                if (splitmessagelowercase[0] == "!addcom" || splitmessagelowercase[0] == "!addelt" || splitmessagelowercase[0] == "!addcommand") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {

                            util.log("ADDCOM: Nutzerlevel des Erstellers akzeptiert");
                            if (splitmessagelowercase[1] !== undefined && splitmessagelowercase[2] !== undefined) {
                                if (activebots["commands"][channel] == undefined) {
                                    activebots["commands"][channel] = {};
                                }
                                if (activebots["commands"][channel][splitmessagelowercase[1]] == undefined) {
                                    if (activebots["users"][channel] == undefined) {
                                        var level = 999;
                                    } else {
                                        var level = activebots["users"][channel].regularlevel;
                                    }
                                    var startattwo = true;

                                    if (isNaN(splitmessagelowercase[1])) {
                                        if (splitmessagelowercase[1] == "-ul=mod" || splitmessagelowercase[1] == "-ul=moderator" || splitmessagelowercase[1] == "mod" || splitmessagelowercase[1] == "moderator") {
                                            util.log("Parsing Userlevel as: Mod");
                                            level = activebots["users"][channel].modlevel;
                                        } else if (splitmessagelowercase[1] == "-ul=reg" || splitmessagelowercase[1] == "-ul=regular" || splitmessagelowercase[1] == "reg" || splitmessagelowercase[1] == "regular" || splitmessagelowercase[1] == "-ul=viewer" || splitmessagelowercase[1] == "viewer") {
                                            util.log("Parsing Userlevel as: Regular");
                                            level = activebots["users"][channel].regularlevel;
                                        } else if (splitmessagelowercase[1] == "-ul=streamer" || splitmessagelowercase[1] == "streamer") {
                                            util.log("Parsing Userlevel as: Streamer");
                                            level = 5;
                                        } else {
                                            startattwo = false;
                                            if (activebots["users"][channel] == undefined) {
                                                level = 999;
                                            } else {
                                                level = activebots["users"][channel].regularlevel;
                                            }
                                        }
                                    } else {
                                        util.log("Writing Raw Userlevel to Database");
                                        level = splitmessagelowercase[1];
                                    }
                                    if (startattwo) {
                                        if (splitmessagelowercase[2].substr(0, 1) == "!") {
                                            var commandname = splitmessagelowercase[2];
                                        } else {
                                            var commandname = "!" + splitmessagelowercase[2];
                                        }
                                        var commandtext = text.replace("!addcom " + splitmessagenormal[1] + " " + splitmessagenormal[1] + " ", "");
                                    } else {
                                        if (splitmessagelowercase[1].substr(0, 1) == "!") {
                                            var commandname = splitmessagelowercase[1];
                                        } else {
                                            var commandname = "!" + splitmessagelowercase[1];
                                        }
                                        var commandtext = text.replace("!addcom " + splitmessagenormal[1] + " ", "");
                                    }
                                    var sql = 'INSERT INTO `commands`(`commandname`, `text`, `userlevel`, `channel`, `creator`, `createtime`) VALUES ("' + mysql.escape(commandname).substr(1, commandname.length) + '","' + mysql.escape(commandtext).substr(1, commandtext.length) + '","' + level + '","' + channel + '","' + nick + '","' + new Date().toJSON() + '");';
                                    util.log("SQL: " + sql);
                                    sqlconnection.query(sql, function(err, results) {
                                        if (err == null) {
                                            util.log("Added Command to Database");
                                            funcret(channel, nick + " -> Added command " + commandname);
                                            refreshbotcommands(channel);
                                        } else {
                                            console.log("SQL ERROR: " + err);
                                        }
                                    })
                                } else {
                                    funcret(channel, nick + " -> Command already exists");
                                }
                            } else {
                                // INVALID COMMAND SYNTAX
                                funcret(channel, nick + " -> Invalid Syntax, correct: !addcom -ul=mod !mycommand My Text");
                                util.log("ADDCOM: Invalid Command Syntax");
                            }

                        }
                    });
                }
                if (splitmessagelowercase[0] == "!editcom" || splitmessagelowercase[0] == "!editcommand") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            if (splitmessagelowercase[1] == "userlevel") {
                                var level = activebots["users"][channel].regularlevel;
                                if (isNaN(splitmessagelowercase[3])) {
                                    if (splitmessagelowercase[3] == "-ul=mod" || splitmessagelowercase[3] == "-ul=moderator" || splitmessagelowercase[3] == "mods" || splitmessagelowercase[3] == "mod" || splitmessagelowercase[3] == "moderator") {
                                        util.log("Parsing Userlevel as: Mod");
                                        level = activebots["users"][channel].modlevel;
                                    } else if (splitmessagelowercase[3] == "-ul=reg" || splitmessagelowercase[3] == "-ul=regular" || splitmessagelowercase[3] == "reg" || splitmessagelowercase[3] == "regular" || splitmessagelowercase[3] == "-ul=viewer" || splitmessagelowercase[3] == "viewer") {
                                        util.log("Parsing Userlevel as: Regular");
                                        level = activebots["users"][channel].regularlevel;
                                    } else if (splitmessagelowercase[3] == "-ul=streamer" || splitmessagelowercase[3] == "streamer") {
                                        util.log("Parsing Userlevel as: Streamer");
                                        level = 5;
                                    } else {
                                        level = activebots["users"][channel].regularlevel;
                                    }
                                } else {
                                    util.log("Writing Raw Userlevel to Database");
                                    level = parseInt(splitmessagelowercase[3]);
                                }
                                if (splitmessagelowercase[2].substr(0, 1) == "!") {
                                    splitmessagelowercase[2] = splitmessagelowercase[2];
                                } else {
                                    splitmessagelowercase[2] = "!" + splitmessagelowercase[2];
                                }
                                var sql = "UPDATE commands SET userlevel=\"" + level + "\" WHERE channel=\"" + channel + "\" AND commandname=" + mysql.escape(splitmessagelowercase[2]) + ";";
                                sqlconnection.query(sql, function(err, results) {
                                    if (err == null) {
                                        refreshbotconfig(channel);
                                        funcret(channel, nick + " -> Update successful");
                                    } else {
                                        console.log("SQL ERROR: " + err);
                                    }
                                })
                            } else if (splitmessagelowercase[1] == "text" && splitmessagenormal[3] !== undefined) {
                                var instext = text.replace(splitmessagenormal[0] + " text " + splitmessagenormal[2] + " ", "");
                                var sql = "UPDATE commands SET text=" + mysql.escape(instext) + " WHERE channel=\"" + channel + "\" AND commandname=" + mysql.escape(splitmessagelowercase[2]) + ";";
                                sqlconnection.query(sql, function(err, results) {
                                    if (err == null) {
                                        refreshbotconfig(channel);
                                        funcret(channel, nick + " -> Update successful");
                                    } else {
                                        console.log("SQL ERROR: " + err);
                                    }
                                });

                            } else {
                                funcret(channel, nick + " -> Command Syntax Error (!editcommand text !yourcommand new text or !editcommand userlevel !yourcommand moderator)");
                            }
                            // TODO: Rename Command Function

                        }
                    });
                }
                if (splitmessagelowercase[0] == "!delcom" || splitmessagelowercase[0] == "!deletecommand" || splitmessagelowercase[0] == "!remcom" || splitmessagelowercase[0] == "!removecommand") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            if (splitmessagelowercase[1][0] === "!") {
                                var commandname = splitmessagelowercase[1];
                            } else {
                                var commandname = "!" + splitmessagelowercase[1];
                            }
                            // CHECK IF COMMAND EXISTS
                            util.log("SQL: SELECT id FROM commands WHERE commandname=" + mysql.escape(commandname) + " AND channel=\"" + channel + "\";");
                            sqlconnection.query("SELECT id FROM commands WHERE commandname=" + mysql.escape(commandname) + " AND channel=\"" + channel + "\";", function(err, results) {
                                if (results[0] !== undefined) {
                                    sqlconnection.query("DELETE FROM `commands` WHERE `id`=" + results[0].id + " AND channel=\"" + channel + "\";", function(err, results) {
                                        if (err == null) {
                                            funcret(channel, nick + " -> Delete successful");
                                            refreshbotconfig(channel);
                                        }
                                    });
                                } else {
                                    funcret(channel, nick + " -> This command doesn't exist");
                                }
                            });

                        }
                    });
                }
                if (splitmessagelowercase[0] == "!permit") {
                    getuserlevel(nick, channel, function(level) {
                        if (level <= thischanmodlevel(channel)) {
                            if (splitmessagelowercase[1] !== undefined) {
                                activebots["config"][channel].permit = splitmessagelowercase[1];
                                funcret(channel, nick + " -> " + splitmessagelowercase[1] + " was given permission to post a link.");
                            }
                        }
                    });
                }
                //MODCHANNELCOMMANDS
                if (sysconf.modchan.indexOf(channel) > -1) {
                    if (splitmessagelowercase[0] == "!join") {
                        if (splitmessagelowercase[1] == undefined) {
                            funcret(channel, "Joining Channel...");
                            join("#" + nick);
                        } else {
                            if (splitmessagelowercase[1][0] !== "#") {
                                splitmessagelowercase[1] = "#" + splitmessagelowercase[1]
                            }
                            getuserlevel(nick, channel, function(usrlevel) {
                                if (usrlevel <= 4) {
                                    join(splitmessagelowercase[1]);
                                    funcret(channel, nick + " -> Joining #" + splitmessagelowercase[1]);
                                }
                            })
                        }
                    } else if (splitmessagelowercase[0] == "!part") {
                        if (splitmessagelowercase[1][0] !== "#") {
                            splitmessagelowercase[1] = "#" + splitmessagelowercase[1]
                        }
                        getuserlevel(nick, channel, function(usrlevel) {
                            if (usrlevel <= 4) {
                                var leavereturn = leave(splitmessagelowercase[1]);
                                if (leavereturn !== undefined) {
                                    funcret(channel, nick + " -> Error: " + leavereturn);
                                } else {
                                    funcret(channel, nick + " -> Leaving #" + splitmessagelowercase[1]);
                                }
                            }
                        })
                    }
                }
                console.timeEnd('commandexec');
            }
        }

        client.on('message', function(username, channel, text) {
            parsecom(username, channel, text, function(retchannel, text) {
                client.say(retchannel, text)
            }, true)
        });
        clientaws.on('message', function(username, channel, text) {
            parsecom(username, channel, text, function(retchannel, text) {
                clientaws.say(retchannel, text)
            }, true)
        });
        var timerloop = setInterval(function() {
            var time = new Date;
            var currentTime = Date.parse(time) / 1000;

            var sql = "SELECT name, text, channel, timerinterval, linex FROM timer WHERE active=" + mysql.escape(true) + ";";
            sqlconnection.query(sql, function(err, results) {
                if (err) throw err;
                results.forEach(function(current) {
                    if (currentTime / (current["timerinterval"] * 60) == Math.floor(currentTime / (current["timerinterval"] * 60))) {
                        if (activebots["config"][current["channel"]] !== undefined && current["linex"] <= activitytimer[current["channel"]]) {
                            if (timers[current["channel"] + "#" + current["name"]] == true || timers[current["channel"] + "#" + current["name"]] == undefined) {
                                client.say(current["channel"], current["text"]);
                                timers[current["channel"] + "#" + current["name"]] = false;
                            } else {}

                        }
                    } else {
                        timers[current["channel"] + "#" + current["name"]] = true;
                    }
                });

            });

            if (currentTime / 300 == Math.floor(currentTime / 300)) {
                for (var index in activitytimer) {
                    if (activitytimer.hasOwnProperty(index)) {
                        activitytimer[index] = 0;
                    }
                }
            }
        }, 1000);
        // TODOCRAWLER

        function getinteractions() {
            var sql = "SELECT * FROM bottodo WHERE chatbot=" + mysql.escape(botusername) + ";";
            sqlconnection.query(sql, function(err, results) {
                if (results[0] !== undefined) {
                    console.log("Found Actions in Control Table: " + results);
                    // THERE IS SOMETHING TO DO!
                    results.forEach(function(current) {
                        if (current.type == "reinit") {
                            refreshbotconfig(current.channel);
                        } else if (current.type == "join") {
                            join(current.channel);
                        } else if (current.type == "part") {
                            leave(current.channel);
                        } else if (current.type == "addcommand") {
                            if (activebots["commands"][current.channel][current.name] == undefined) {
                                var sql = 'INSERT INTO `commands`(`commandname`, `text`, `userlevel`, `channel`, `creator`, `createtime`) VALUES ("' + mysql.escape(current.name).substr(1, current.name.length) + '",' + mysql.escape(current.text) + ',"' + current.userlevel + '","' + current.channel + '","' + current.initby + '","' + new Date().toJSON() + '");';
                                util.log("SQL: " + sql);
                                sqlconnection.query(sql, function(err, results) {
                                    if (err !== null) {
                                        console.log("SQL ERROR: " + err);
                                    }
                                })
                            } else {

                            }
                        } else if (current.type == "deletecommand") {
                            var sql = 'DELETE FROM `commands` WHERE `commandname`=' + mysql.escape(current.name) + ";";
                            sqlconnection.query(sql);
                        } else if (current.type == "editcommandusrlevel") {
                            var sql = "UPDATE commands SET userlevel=\"" + current.userlevel + "\" WHERE channel=\"" + current.channel + "\" AND commandname=\"" + current.name + "\";";
                            sqlconnection.query(sql);
                        } else if (current.type == "editcommandtext") {
                            var sql = "UPDATE commands SET text=\"" + current.text + "\" WHERE channel=\"" + current.channel + "\" AND commandname=\"" + current.name + "\";";
                            sqlconnection.query(sql);
                        } else if (current.type == "buildbot") {
                            var sql = "";
                            sqlconnection.query(sql);
                        } else if (current.type == "WABOTPROCESS") {
                            util.log("WATSAPP BOT: PARSING MSG");
                            parsecom(current.name, "#xovigin", current.text, function(chandone, rettext) {
                                sqlconnection.query("INSERT INTO bottodo (type, channel, text) VALUES ('WABOTSEND', " + mysql.escape(current.channel) + ", " + mysql.escape(rettext).replace(".me", "Ginnie") + ");");
                            }, false);
                        }
                        var sql = "INSERT botactionsdone (type, channel, chatbot, initby, name, userlevel, text) SELECT type, channel, chatbot, initby, name, userlevel, text FROM bottodo WHERE id=" + mysql.escape(current.id) + ";";
                        sqlconnection.query(sql, function(err, results) {
                            if (err !== null) {
                                console.log("SQL ERROR: " + err);
                            } else {
                                var sql = "DELETE FROM `bottodo` WHERE `id`=" + mysql.escape(current.id) + ";";
                                sqlconnection.query(sql, function(err, results) {
                                    if (err !== null) {
                                        console.log("SQL ERR: " + err)
                                    }
                                });
                            }

                        })
                    })

                }
            })
        }

        controlloop = setInterval(function() {
            getinteractions();
        }, 1000);
    }, 1000);
}, 2000);