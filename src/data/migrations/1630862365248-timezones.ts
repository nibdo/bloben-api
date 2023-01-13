import { MigrationInterface, QueryRunner } from 'typeorm';

export class Timezones1630862365248 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
INSERT INTO timezones (name)
VALUES ('floating');
INSERT INTO timezones (name)
VALUES ('Africa/Abidjan');
INSERT INTO timezones (name)
VALUES ('Africa/Accra');
INSERT INTO timezones (name)
VALUES ('Africa/Addis_Ababa');
INSERT INTO timezones (name)
VALUES ('Africa/Algiers');
INSERT INTO timezones (name)
VALUES ('Africa/Asmara');
INSERT INTO timezones (name)
VALUES ('Africa/Bamako');
INSERT INTO timezones (name)
VALUES ('Africa/Bangui');
INSERT INTO timezones (name)
VALUES ('Africa/Banjul');
INSERT INTO timezones (name)
VALUES ('Africa/Bissau');
INSERT INTO timezones (name)
VALUES ('Africa/Blantyre');
INSERT INTO timezones (name)
VALUES ('Africa/Brazzaville');
INSERT INTO timezones (name)
VALUES ('Africa/Bujumbura');
INSERT INTO timezones (name)
VALUES ('Africa/Cairo');
INSERT INTO timezones (name)
VALUES ('Africa/Casablanca');
INSERT INTO timezones (name)
VALUES ('Africa/Ceuta');
INSERT INTO timezones (name)
VALUES ('Africa/Conakry');
INSERT INTO timezones (name)
VALUES ('Africa/Dakar');
INSERT INTO timezones (name)
VALUES ('Africa/Dar_es_Salaam');
INSERT INTO timezones (name)
VALUES ('Africa/Djibouti');
INSERT INTO timezones (name)
VALUES ('Africa/Douala');
INSERT INTO timezones (name)
VALUES ('Africa/El_Aaiun');
INSERT INTO timezones (name)
VALUES ('Africa/Freetown');
INSERT INTO timezones (name)
VALUES ('Africa/Gaborone');
INSERT INTO timezones (name)
VALUES ('Africa/Harare');
INSERT INTO timezones (name)
VALUES ('Africa/Johannesburg');
INSERT INTO timezones (name)
VALUES ('Africa/Juba');
INSERT INTO timezones (name)
VALUES ('Africa/Kampala');
INSERT INTO timezones (name)
VALUES ('Africa/Khartoum');
INSERT INTO timezones (name)
VALUES ('Africa/Kigali');
INSERT INTO timezones (name)
VALUES ('Africa/Kinshasa');
INSERT INTO timezones (name)
VALUES ('Africa/Lagos');
INSERT INTO timezones (name)
VALUES ('Africa/Libreville');
INSERT INTO timezones (name)
VALUES ('Africa/Lome');
INSERT INTO timezones (name)
VALUES ('Africa/Luanda');
INSERT INTO timezones (name)
VALUES ('Africa/Lubumbashi');
INSERT INTO timezones (name)
VALUES ('Africa/Lusaka');
INSERT INTO timezones (name)
VALUES ('Africa/Malabo');
INSERT INTO timezones (name)
VALUES ('Africa/Maputo');
INSERT INTO timezones (name)
VALUES ('Africa/Maseru');
INSERT INTO timezones (name)
VALUES ('Africa/Mbabane');
INSERT INTO timezones (name)
VALUES ('Africa/Mogadishu');
INSERT INTO timezones (name)
VALUES ('Africa/Monrovia');
INSERT INTO timezones (name)
VALUES ('Africa/Nairobi');
INSERT INTO timezones (name)
VALUES ('Africa/Ndjamena');
INSERT INTO timezones (name)
VALUES ('Africa/Niamey');
INSERT INTO timezones (name)
VALUES ('Africa/Nouakchott');
INSERT INTO timezones (name)
VALUES ('Africa/Ouagadougou');
INSERT INTO timezones (name)
VALUES ('Africa/Porto-Novo');
INSERT INTO timezones (name)
VALUES ('Africa/Sao_Tome');
INSERT INTO timezones (name)
VALUES ('Africa/Timbuktu');
INSERT INTO timezones (name)
VALUES ('Africa/Tripoli');
INSERT INTO timezones (name)
VALUES ('Africa/Tunis');
INSERT INTO timezones (name)
VALUES ('Africa/Windhoek');
INSERT INTO timezones (name)
VALUES ('America/Adak');
INSERT INTO timezones (name)
VALUES ('America/Anchorage');
INSERT INTO timezones (name)
VALUES ('America/Anguilla');
INSERT INTO timezones (name)
VALUES ('America/Antigua');
INSERT INTO timezones (name)
VALUES ('America/Araguaina');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Buenos_Aires');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Catamarca');
INSERT INTO timezones (name)
VALUES ('America/Argentina/ComodRivadavia');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Cordoba');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Jujuy');
INSERT INTO timezones (name)
VALUES ('America/Argentina/La_Rioja');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Mendoza');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Rio_Gallegos');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Salta');
INSERT INTO timezones (name)
VALUES ('America/Argentina/San_Juan');
INSERT INTO timezones (name)
VALUES ('America/Argentina/San_Luis');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Tucuman');
INSERT INTO timezones (name)
VALUES ('America/Argentina/Ushuaia');
INSERT INTO timezones (name)
VALUES ('America/Aruba');
INSERT INTO timezones (name)
VALUES ('America/Asuncion');
INSERT INTO timezones (name)
VALUES ('America/Atikokan');
INSERT INTO timezones (name)
VALUES ('America/Atka');
INSERT INTO timezones (name)
VALUES ('America/Bahia');
INSERT INTO timezones (name)
VALUES ('America/Bahia_Banderas');
INSERT INTO timezones (name)
VALUES ('America/Barbados');
INSERT INTO timezones (name)
VALUES ('America/Belem');
INSERT INTO timezones (name)
VALUES ('America/Belize');
INSERT INTO timezones (name)
VALUES ('America/Blanc-Sablon');
INSERT INTO timezones (name)
VALUES ('America/Boa_Vista');
INSERT INTO timezones (name)
VALUES ('America/Bogota');
INSERT INTO timezones (name)
VALUES ('America/Boise');
INSERT INTO timezones (name)
VALUES ('America/Buenos_Aires');
INSERT INTO timezones (name)
VALUES ('America/Cambridge_Bay');
INSERT INTO timezones (name)
VALUES ('America/Campo_Grande');
INSERT INTO timezones (name)
VALUES ('America/Cancun');
INSERT INTO timezones (name)
VALUES ('America/Caracas');
INSERT INTO timezones (name)
VALUES ('America/Catamarca');
INSERT INTO timezones (name)
VALUES ('America/Cayenne');
INSERT INTO timezones (name)
VALUES ('America/Cayman');
INSERT INTO timezones (name)
VALUES ('America/Chicago');
INSERT INTO timezones (name)
VALUES ('America/Chihuahua');
INSERT INTO timezones (name)
VALUES ('America/Coral_Harbour');
INSERT INTO timezones (name)
VALUES ('America/Cordoba');
INSERT INTO timezones (name)
VALUES ('America/Costa_Rica');
INSERT INTO timezones (name)
VALUES ('America/Creston');
INSERT INTO timezones (name)
VALUES ('America/Cuiaba');
INSERT INTO timezones (name)
VALUES ('America/Curacao');
INSERT INTO timezones (name)
VALUES ('America/Danmarkshavn');
INSERT INTO timezones (name)
VALUES ('America/Dawson');
INSERT INTO timezones (name)
VALUES ('America/Dawson_Creek');
INSERT INTO timezones (name)
VALUES ('America/Denver');
INSERT INTO timezones (name)
VALUES ('America/Detroit');
INSERT INTO timezones (name)
VALUES ('America/Dominica');
INSERT INTO timezones (name)
VALUES ('America/Edmonton');
INSERT INTO timezones (name)
VALUES ('America/Eirunepe');
INSERT INTO timezones (name)
VALUES ('America/El_Salvador');
INSERT INTO timezones (name)
VALUES ('America/Ensenada');
INSERT INTO timezones (name)
VALUES ('America/Fort_Nelson');
INSERT INTO timezones (name)
VALUES ('America/Fort_Wayne');
INSERT INTO timezones (name)
VALUES ('America/Fortaleza');
INSERT INTO timezones (name)
VALUES ('America/Glace_Bay');
INSERT INTO timezones (name)
VALUES ('America/Godthab');
INSERT INTO timezones (name)
VALUES ('America/Goose_Bay');
INSERT INTO timezones (name)
VALUES ('America/Grand_Turk');
INSERT INTO timezones (name)
VALUES ('America/Grenada');
INSERT INTO timezones (name)
VALUES ('America/Guadeloupe');
INSERT INTO timezones (name)
VALUES ('America/Guatemala');
INSERT INTO timezones (name)
VALUES ('America/Guayaquil');
INSERT INTO timezones (name)
VALUES ('America/Guyana');
INSERT INTO timezones (name)
VALUES ('America/Halifax');
INSERT INTO timezones (name)
VALUES ('America/Havana');
INSERT INTO timezones (name)
VALUES ('America/Hermosillo');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Indianapolis');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Knox');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Marengo');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Petersburg');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Tell_City');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Vevay');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Vincennes');
INSERT INTO timezones (name)
VALUES ('America/Indiana/Winamac');
INSERT INTO timezones (name)
VALUES ('America/Indianapolis');
INSERT INTO timezones (name)
VALUES ('America/Inuvik');
INSERT INTO timezones (name)
VALUES ('America/Iqaluit');
INSERT INTO timezones (name)
VALUES ('America/Jamaica');
INSERT INTO timezones (name)
VALUES ('America/Jujuy');
INSERT INTO timezones (name)
VALUES ('America/Juneau');
INSERT INTO timezones (name)
VALUES ('America/Kentucky/Louisville');
INSERT INTO timezones (name)
VALUES ('America/Kentucky/Monticello');
INSERT INTO timezones (name)
VALUES ('America/Knox_IN');
INSERT INTO timezones (name)
VALUES ('America/Kralendijk');
INSERT INTO timezones (name)
VALUES ('America/La_Paz');
INSERT INTO timezones (name)
VALUES ('America/Lima');
INSERT INTO timezones (name)
VALUES ('America/Los_Angeles');
INSERT INTO timezones (name)
VALUES ('America/Louisville');
INSERT INTO timezones (name)
VALUES ('America/Lower_Princes');
INSERT INTO timezones (name)
VALUES ('America/Maceio');
INSERT INTO timezones (name)
VALUES ('America/Managua');
INSERT INTO timezones (name)
VALUES ('America/Manaus');
INSERT INTO timezones (name)
VALUES ('America/Marigot');
INSERT INTO timezones (name)
VALUES ('America/Martinique');
INSERT INTO timezones (name)
VALUES ('America/Matamoros');
INSERT INTO timezones (name)
VALUES ('America/Mazatlan');
INSERT INTO timezones (name)
VALUES ('America/Mendoza');
INSERT INTO timezones (name)
VALUES ('America/Menominee');
INSERT INTO timezones (name)
VALUES ('America/Merida');
INSERT INTO timezones (name)
VALUES ('America/Metlakatla');
INSERT INTO timezones (name)
VALUES ('America/Mexico_City');
INSERT INTO timezones (name)
VALUES ('America/Miquelon');
INSERT INTO timezones (name)
VALUES ('America/Moncton');
INSERT INTO timezones (name)
VALUES ('America/Monterrey');
INSERT INTO timezones (name)
VALUES ('America/Montevideo');
INSERT INTO timezones (name)
VALUES ('America/Montreal');
INSERT INTO timezones (name)
VALUES ('America/Montserrat');
INSERT INTO timezones (name)
VALUES ('America/Nassau');
INSERT INTO timezones (name)
VALUES ('America/New_York');
INSERT INTO timezones (name)
VALUES ('America/Nipigon');
INSERT INTO timezones (name)
VALUES ('America/Nome');
INSERT INTO timezones (name)
VALUES ('America/Noronha');
INSERT INTO timezones (name)
VALUES ('America/North_Dakota/Beulah');
INSERT INTO timezones (name)
VALUES ('America/North_Dakota/Center');
INSERT INTO timezones (name)
VALUES ('America/North_Dakota/New_Salem');
INSERT INTO timezones (name)
VALUES ('America/Ojinaga');
INSERT INTO timezones (name)
VALUES ('America/Panama');
INSERT INTO timezones (name)
VALUES ('America/Pangnirtung');
INSERT INTO timezones (name)
VALUES ('America/Paramaribo');
INSERT INTO timezones (name)
VALUES ('America/Phoenix');
INSERT INTO timezones (name)
VALUES ('America/Port_of_Spain');
INSERT INTO timezones (name)
VALUES ('America/Port-au-Prince');
INSERT INTO timezones (name)
VALUES ('America/Porto_Acre');
INSERT INTO timezones (name)
VALUES ('America/Porto_Velho');
INSERT INTO timezones (name)
VALUES ('America/Puerto_Rico');
INSERT INTO timezones (name)
VALUES ('America/Punta_Arenas');
INSERT INTO timezones (name)
VALUES ('America/Rainy_River');
INSERT INTO timezones (name)
VALUES ('America/Rankin_Inlet');
INSERT INTO timezones (name)
VALUES ('America/Recife');
INSERT INTO timezones (name)
VALUES ('America/Regina');
INSERT INTO timezones (name)
VALUES ('America/Resolute');
INSERT INTO timezones (name)
VALUES ('America/Rio_Branco');
INSERT INTO timezones (name)
VALUES ('America/Rosario');
INSERT INTO timezones (name)
VALUES ('America/Santa_Isabel');
INSERT INTO timezones (name)
VALUES ('America/Santarem');
INSERT INTO timezones (name)
VALUES ('America/Santiago');
INSERT INTO timezones (name)
VALUES ('America/Santo_Domingo');
INSERT INTO timezones (name)
VALUES ('America/Sao_Paulo');
INSERT INTO timezones (name)
VALUES ('America/Scoresbysund');
INSERT INTO timezones (name)
VALUES ('America/Shiprock');
INSERT INTO timezones (name)
VALUES ('America/Sitka');
INSERT INTO timezones (name)
VALUES ('America/St_Barthelemy');
INSERT INTO timezones (name)
VALUES ('America/St_Johns');
INSERT INTO timezones (name)
VALUES ('America/St_Kitts');
INSERT INTO timezones (name)
VALUES ('America/St_Lucia');
INSERT INTO timezones (name)
VALUES ('America/St_Thomas');
INSERT INTO timezones (name)
VALUES ('America/St_Vincent');
INSERT INTO timezones (name)
VALUES ('America/Swift_Current');
INSERT INTO timezones (name)
VALUES ('America/Tegucigalpa');
INSERT INTO timezones (name)
VALUES ('America/Thule');
INSERT INTO timezones (name)
VALUES ('America/Thunder_Bay');
INSERT INTO timezones (name)
VALUES ('America/Tijuana');
INSERT INTO timezones (name)
VALUES ('America/Toronto');
INSERT INTO timezones (name)
VALUES ('America/Tortola');
INSERT INTO timezones (name)
VALUES ('America/Vancouver');
INSERT INTO timezones (name)
VALUES ('America/Virgin');
INSERT INTO timezones (name)
VALUES ('America/Whitehorse');
INSERT INTO timezones (name)
VALUES ('America/Winnipeg');
INSERT INTO timezones (name)
VALUES ('America/Yakutat');
INSERT INTO timezones (name)
VALUES ('America/Yellowknife');
INSERT INTO timezones (name)
VALUES ('Antarctica/Casey');
INSERT INTO timezones (name)
VALUES ('Antarctica/Davis');
INSERT INTO timezones (name)
VALUES ('Antarctica/DumontDUrville');
INSERT INTO timezones (name)
VALUES ('Antarctica/Macquarie');
INSERT INTO timezones (name)
VALUES ('Antarctica/Mawson');
INSERT INTO timezones (name)
VALUES ('Antarctica/McMurdo');
INSERT INTO timezones (name)
VALUES ('Antarctica/Palmer');
INSERT INTO timezones (name)
VALUES ('Antarctica/Rothera');
INSERT INTO timezones (name)
VALUES ('Antarctica/South_Pole');
INSERT INTO timezones (name)
VALUES ('Antarctica/Syowa');
INSERT INTO timezones (name)
VALUES ('Antarctica/Troll');
INSERT INTO timezones (name)
VALUES ('Antarctica/Vostok');
INSERT INTO timezones (name)
VALUES ('Arctic/Longyearbyen');
INSERT INTO timezones (name)
VALUES ('Asia/Aden');
INSERT INTO timezones (name)
VALUES ('Asia/Almaty');
INSERT INTO timezones (name)
VALUES ('Asia/Amman');
INSERT INTO timezones (name)
VALUES ('Asia/Anadyr');
INSERT INTO timezones (name)
VALUES ('Asia/Aqtau');
INSERT INTO timezones (name)
VALUES ('Asia/Aqtobe');
INSERT INTO timezones (name)
VALUES ('Asia/Ashgabat');
INSERT INTO timezones (name)
VALUES ('Asia/Ashkhabad');
INSERT INTO timezones (name)
VALUES ('Asia/Atyrau');
INSERT INTO timezones (name)
VALUES ('Asia/Baghdad');
INSERT INTO timezones (name)
VALUES ('Asia/Bahrain');
INSERT INTO timezones (name)
VALUES ('Asia/Baku');
INSERT INTO timezones (name)
VALUES ('Asia/Bangkok');
INSERT INTO timezones (name)
VALUES ('Asia/Barnaul');
INSERT INTO timezones (name)
VALUES ('Asia/Beirut');
INSERT INTO timezones (name)
VALUES ('Asia/Bishkek');
INSERT INTO timezones (name)
VALUES ('Asia/Brunei');
INSERT INTO timezones (name)
VALUES ('Asia/Calcutta');
INSERT INTO timezones (name)
VALUES ('Asia/Chita');
INSERT INTO timezones (name)
VALUES ('Asia/Choibalsan');
INSERT INTO timezones (name)
VALUES ('Asia/Chongqing');
INSERT INTO timezones (name)
VALUES ('Asia/Chungking');
INSERT INTO timezones (name)
VALUES ('Asia/Colombo');
INSERT INTO timezones (name)
VALUES ('Asia/Dacca');
INSERT INTO timezones (name)
VALUES ('Asia/Damascus');
INSERT INTO timezones (name)
VALUES ('Asia/Dhaka');
INSERT INTO timezones (name)
VALUES ('Asia/Dili');
INSERT INTO timezones (name)
VALUES ('Asia/Dubai');
INSERT INTO timezones (name)
VALUES ('Asia/Dushanbe');
INSERT INTO timezones (name)
VALUES ('Asia/Famagusta');
INSERT INTO timezones (name)
VALUES ('Asia/Gaza');
INSERT INTO timezones (name)
VALUES ('Asia/Harbin');
INSERT INTO timezones (name)
VALUES ('Asia/Hebron');
INSERT INTO timezones (name)
VALUES ('Asia/Ho_Chi_Minh');
INSERT INTO timezones (name)
VALUES ('Asia/Hong_Kong');
INSERT INTO timezones (name)
VALUES ('Asia/Hovd');
INSERT INTO timezones (name)
VALUES ('Asia/Irkutsk');
INSERT INTO timezones (name)
VALUES ('Asia/Istanbul');
INSERT INTO timezones (name)
VALUES ('Asia/Jakarta');
INSERT INTO timezones (name)
VALUES ('Asia/Jayapura');
INSERT INTO timezones (name)
VALUES ('Asia/Jerusalem');
INSERT INTO timezones (name)
VALUES ('Asia/Kabul');
INSERT INTO timezones (name)
VALUES ('Asia/Kamchatka');
INSERT INTO timezones (name)
VALUES ('Asia/Karachi');
INSERT INTO timezones (name)
VALUES ('Asia/Kashgar');
INSERT INTO timezones (name)
VALUES ('Asia/Kathmandu');
INSERT INTO timezones (name)
VALUES ('Asia/Katmandu');
INSERT INTO timezones (name)
VALUES ('Asia/Khandyga');
INSERT INTO timezones (name)
VALUES ('Asia/Kolkata');
INSERT INTO timezones (name)
VALUES ('Asia/Krasnoyarsk');
INSERT INTO timezones (name)
VALUES ('Asia/Kuala_Lumpur');
INSERT INTO timezones (name)
VALUES ('Asia/Kuching');
INSERT INTO timezones (name)
VALUES ('Asia/Kuwait');
INSERT INTO timezones (name)
VALUES ('Asia/Macao');
INSERT INTO timezones (name)
VALUES ('Asia/Macau');
INSERT INTO timezones (name)
VALUES ('Asia/Magadan');
INSERT INTO timezones (name)
VALUES ('Asia/Makassar');
INSERT INTO timezones (name)
VALUES ('Asia/Manila');
INSERT INTO timezones (name)
VALUES ('Asia/Muscat');
INSERT INTO timezones (name)
VALUES ('Asia/Novokuznetsk');
INSERT INTO timezones (name)
VALUES ('Asia/Novosibirsk');
INSERT INTO timezones (name)
VALUES ('Asia/Omsk');
INSERT INTO timezones (name)
VALUES ('Asia/Oral');
INSERT INTO timezones (name)
VALUES ('Asia/Phnom_Penh');
INSERT INTO timezones (name)
VALUES ('Asia/Pontianak');
INSERT INTO timezones (name)
VALUES ('Asia/Pyongyang');
INSERT INTO timezones (name)
VALUES ('Asia/Qatar');
INSERT INTO timezones (name)
VALUES ('Asia/Qyzylorda');
INSERT INTO timezones (name)
VALUES ('Asia/Rangoon');
INSERT INTO timezones (name)
VALUES ('Asia/Riyadh');
INSERT INTO timezones (name)
VALUES ('Asia/Saigon');
INSERT INTO timezones (name)
VALUES ('Asia/Sakhalin');
INSERT INTO timezones (name)
VALUES ('Asia/Samarkand');
INSERT INTO timezones (name)
VALUES ('Asia/Seoul');
INSERT INTO timezones (name)
VALUES ('Asia/Shanghai');
INSERT INTO timezones (name)
VALUES ('Asia/Singapore');
INSERT INTO timezones (name)
VALUES ('Asia/Srednekolymsk');
INSERT INTO timezones (name)
VALUES ('Asia/Taipei');
INSERT INTO timezones (name)
VALUES ('Asia/Tashkent');
INSERT INTO timezones (name)
VALUES ('Asia/Tbilisi');
INSERT INTO timezones (name)
VALUES ('Asia/Tehran');
INSERT INTO timezones (name)
VALUES ('Asia/Tel_Aviv');
INSERT INTO timezones (name)
VALUES ('Asia/Thimbu');
INSERT INTO timezones (name)
VALUES ('Asia/Thimphu');
INSERT INTO timezones (name)
VALUES ('Asia/Tokyo');
INSERT INTO timezones (name)
VALUES ('Asia/Tomsk');
INSERT INTO timezones (name)
VALUES ('Asia/Ujung_Pandang');
INSERT INTO timezones (name)
VALUES ('Asia/Ulaanbaatar');
INSERT INTO timezones (name)
VALUES ('Asia/Ulan_Bator');
INSERT INTO timezones (name)
VALUES ('Asia/Urumqi');
INSERT INTO timezones (name)
VALUES ('Asia/Ust-Nera');
INSERT INTO timezones (name)
VALUES ('Asia/Vientiane');
INSERT INTO timezones (name)
VALUES ('Asia/Vladivostok');
INSERT INTO timezones (name)
VALUES ('Asia/Yakutsk');
INSERT INTO timezones (name)
VALUES ('Asia/Yangon');
INSERT INTO timezones (name)
VALUES ('Asia/Yekaterinburg');
INSERT INTO timezones (name)
VALUES ('Asia/Yerevan');
INSERT INTO timezones (name)
VALUES ('Atlantic/Azores');
INSERT INTO timezones (name)
VALUES ('Atlantic/Bermuda');
INSERT INTO timezones (name)
VALUES ('Atlantic/Canary');
INSERT INTO timezones (name)
VALUES ('Atlantic/Cape_Verde');
INSERT INTO timezones (name)
VALUES ('Atlantic/Faeroe');
INSERT INTO timezones (name)
VALUES ('Atlantic/Faroe');
INSERT INTO timezones (name)
VALUES ('Atlantic/Jan_Mayen');
INSERT INTO timezones (name)
VALUES ('Atlantic/Madeira');
INSERT INTO timezones (name)
VALUES ('Atlantic/Reykjavik');
INSERT INTO timezones (name)
VALUES ('Atlantic/South_Georgia');
INSERT INTO timezones (name)
VALUES ('Atlantic/St_Helena');
INSERT INTO timezones (name)
VALUES ('Atlantic/Stanley');
INSERT INTO timezones (name)
VALUES ('Australia/ACT');
INSERT INTO timezones (name)
VALUES ('Australia/Adelaide');
INSERT INTO timezones (name)
VALUES ('Australia/Brisbane');
INSERT INTO timezones (name)
VALUES ('Australia/Broken_Hill');
INSERT INTO timezones (name)
VALUES ('Australia/Canberra');
INSERT INTO timezones (name)
VALUES ('Australia/Currie');
INSERT INTO timezones (name)
VALUES ('Australia/Darwin');
INSERT INTO timezones (name)
VALUES ('Australia/Eucla');
INSERT INTO timezones (name)
VALUES ('Australia/Hobart');
INSERT INTO timezones (name)
VALUES ('Australia/LHI');
INSERT INTO timezones (name)
VALUES ('Australia/Lindeman');
INSERT INTO timezones (name)
VALUES ('Australia/Lord_Howe');
INSERT INTO timezones (name)
VALUES ('Australia/Melbourne');
INSERT INTO timezones (name)
VALUES ('Australia/North');
INSERT INTO timezones (name)
VALUES ('Australia/NSW');
INSERT INTO timezones (name)
VALUES ('Australia/Perth');
INSERT INTO timezones (name)
VALUES ('Australia/Queensland');
INSERT INTO timezones (name)
VALUES ('Australia/South');
INSERT INTO timezones (name)
VALUES ('Australia/Sydney');
INSERT INTO timezones (name)
VALUES ('Australia/Tasmania');
INSERT INTO timezones (name)
VALUES ('Australia/Victoria');
INSERT INTO timezones (name)
VALUES ('Australia/West');
INSERT INTO timezones (name)
VALUES ('Australia/Yancowinna');
INSERT INTO timezones (name)
VALUES ('Brazil/Acre');
INSERT INTO timezones (name)
VALUES ('Brazil/DeNoronha');
INSERT INTO timezones (name)
VALUES ('Brazil/East');
INSERT INTO timezones (name)
VALUES ('Brazil/West');
INSERT INTO timezones (name)
VALUES ('Canada/Atlantic');
INSERT INTO timezones (name)
VALUES ('Canada/Central');
INSERT INTO timezones (name)
VALUES ('Canada/Eastern');
INSERT INTO timezones (name)
VALUES ('Canada/Mountain');
INSERT INTO timezones (name)
VALUES ('Canada/Newfoundland');
INSERT INTO timezones (name)
VALUES ('Canada/Pacific');
INSERT INTO timezones (name)
VALUES ('Canada/Saskatchewan');
INSERT INTO timezones (name)
VALUES ('Canada/Yukon');
INSERT INTO timezones (name)
VALUES ('CET');
INSERT INTO timezones (name)
VALUES ('Chile/Continental');
INSERT INTO timezones (name)
VALUES ('Chile/EasterIsland');
INSERT INTO timezones (name)
VALUES ('CST6CDT');
INSERT INTO timezones (name)
VALUES ('Cuba');
INSERT INTO timezones (name)
VALUES ('EET');
INSERT INTO timezones (name)
VALUES ('Egypt');
INSERT INTO timezones (name)
VALUES ('Eire');
INSERT INTO timezones (name)
VALUES ('EST');
INSERT INTO timezones (name)
VALUES ('EST5EDT');
INSERT INTO timezones (name)
VALUES ('Etc/GMT');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+0');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+1');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+10');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+11');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+12');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+2');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+3');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+4');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+5');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+6');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+7');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+8');
INSERT INTO timezones (name)
VALUES ('Etc/GMT+9');
INSERT INTO timezones (name)
VALUES ('Etc/GMT0');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-0');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-1');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-10');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-11');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-12');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-13');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-14');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-2');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-3');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-4');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-5');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-6');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-7');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-8');
INSERT INTO timezones (name)
VALUES ('Etc/GMT-9');
INSERT INTO timezones (name)
VALUES ('Etc/Greenwich');
INSERT INTO timezones (name)
VALUES ('Etc/UCT');
INSERT INTO timezones (name)
VALUES ('Etc/Universal');
INSERT INTO timezones (name)
VALUES ('Etc/UTC');
INSERT INTO timezones (name)
VALUES ('Etc/Zulu');
INSERT INTO timezones (name)
VALUES ('Europe/Amsterdam');
INSERT INTO timezones (name)
VALUES ('Europe/Andorra');
INSERT INTO timezones (name)
VALUES ('Europe/Astrakhan');
INSERT INTO timezones (name)
VALUES ('Europe/Athens');
INSERT INTO timezones (name)
VALUES ('Europe/Belfast');
INSERT INTO timezones (name)
VALUES ('Europe/Belgrade');
INSERT INTO timezones (name)
VALUES ('Europe/Berlin');
INSERT INTO timezones (name)
VALUES ('Europe/Bratislava');
INSERT INTO timezones (name)
VALUES ('Europe/Brussels');
INSERT INTO timezones (name)
VALUES ('Europe/Bucharest');
INSERT INTO timezones (name)
VALUES ('Europe/Budapest');
INSERT INTO timezones (name)
VALUES ('Europe/Busingen');
INSERT INTO timezones (name)
VALUES ('Europe/Chisinau');
INSERT INTO timezones (name)
VALUES ('Europe/Copenhagen');
INSERT INTO timezones (name)
VALUES ('Europe/Dublin');
INSERT INTO timezones (name)
VALUES ('Europe/Gibraltar');
INSERT INTO timezones (name)
VALUES ('Europe/Guernsey');
INSERT INTO timezones (name)
VALUES ('Europe/Helsinki');
INSERT INTO timezones (name)
VALUES ('Europe/Isle_of_Man');
INSERT INTO timezones (name)
VALUES ('Europe/Istanbul');
INSERT INTO timezones (name)
VALUES ('Europe/Jersey');
INSERT INTO timezones (name)
VALUES ('Europe/Kaliningrad');
INSERT INTO timezones (name)
VALUES ('Europe/Kiev');
INSERT INTO timezones (name)
VALUES ('Europe/Kirov');
INSERT INTO timezones (name)
VALUES ('Europe/Lisbon');
INSERT INTO timezones (name)
VALUES ('Europe/Ljubljana');
INSERT INTO timezones (name)
VALUES ('Europe/London');
INSERT INTO timezones (name)
VALUES ('Europe/Luxembourg');
INSERT INTO timezones (name)
VALUES ('Europe/Madrid');
INSERT INTO timezones (name)
VALUES ('Europe/Malta');
INSERT INTO timezones (name)
VALUES ('Europe/Mariehamn');
INSERT INTO timezones (name)
VALUES ('Europe/Minsk');
INSERT INTO timezones (name)
VALUES ('Europe/Monaco');
INSERT INTO timezones (name)
VALUES ('Europe/Moscow');
INSERT INTO timezones (name)
VALUES ('Asia/Nicosia');
INSERT INTO timezones (name)
VALUES ('Europe/Oslo');
INSERT INTO timezones (name)
VALUES ('Europe/Paris');
INSERT INTO timezones (name)
VALUES ('Europe/Podgorica');
INSERT INTO timezones (name)
VALUES ('Europe/Prague');
INSERT INTO timezones (name)
VALUES ('Europe/Riga');
INSERT INTO timezones (name)
VALUES ('Europe/Rome');
INSERT INTO timezones (name)
VALUES ('Europe/Samara');
INSERT INTO timezones (name)
VALUES ('Europe/San_Marino');
INSERT INTO timezones (name)
VALUES ('Europe/Sarajevo');
INSERT INTO timezones (name)
VALUES ('Europe/Saratov');
INSERT INTO timezones (name)
VALUES ('Europe/Simferopol');
INSERT INTO timezones (name)
VALUES ('Europe/Skopje');
INSERT INTO timezones (name)
VALUES ('Europe/Sofia');
INSERT INTO timezones (name)
VALUES ('Europe/Stockholm');
INSERT INTO timezones (name)
VALUES ('Europe/Tallinn');
INSERT INTO timezones (name)
VALUES ('Europe/Tirane');
INSERT INTO timezones (name)
VALUES ('Europe/Tiraspol');
INSERT INTO timezones (name)
VALUES ('Europe/Ulyanovsk');
INSERT INTO timezones (name)
VALUES ('Europe/Uzhgorod');
INSERT INTO timezones (name)
VALUES ('Europe/Vaduz');
INSERT INTO timezones (name)
VALUES ('Europe/Vatican');
INSERT INTO timezones (name)
VALUES ('Europe/Vienna');
INSERT INTO timezones (name)
VALUES ('Europe/Vilnius');
INSERT INTO timezones (name)
VALUES ('Europe/Volgograd');
INSERT INTO timezones (name)
VALUES ('Europe/Warsaw');
INSERT INTO timezones (name)
VALUES ('Europe/Zagreb');
INSERT INTO timezones (name)
VALUES ('Europe/Zaporozhye');
INSERT INTO timezones (name)
VALUES ('Europe/Zurich');
INSERT INTO timezones (name)
VALUES ('GB');
INSERT INTO timezones (name)
VALUES ('GB-Eire');
INSERT INTO timezones (name)
VALUES ('GMT');
INSERT INTO timezones (name)
VALUES ('GMT+0');
INSERT INTO timezones (name)
VALUES ('GMT0');
INSERT INTO timezones (name)
VALUES ('GMT−0');
INSERT INTO timezones (name)
VALUES ('Greenwich');
INSERT INTO timezones (name)
VALUES ('Hongkong');
INSERT INTO timezones (name)
VALUES ('HST');
INSERT INTO timezones (name)
VALUES ('Iceland');
INSERT INTO timezones (name)
VALUES ('Indian/Antananarivo');
INSERT INTO timezones (name)
VALUES ('Indian/Chagos');
INSERT INTO timezones (name)
VALUES ('Indian/Christmas');
INSERT INTO timezones (name)
VALUES ('Indian/Cocos');
INSERT INTO timezones (name)
VALUES ('Indian/Comoro');
INSERT INTO timezones (name)
VALUES ('Indian/Kerguelen');
INSERT INTO timezones (name)
VALUES ('Indian/Mahe');
INSERT INTO timezones (name)
VALUES ('Indian/Maldives');
INSERT INTO timezones (name)
VALUES ('Indian/Mauritius');
INSERT INTO timezones (name)
VALUES ('Indian/Mayotte');
INSERT INTO timezones (name)
VALUES ('Indian/Reunion');
INSERT INTO timezones (name)
VALUES ('Iran');
INSERT INTO timezones (name)
VALUES ('Israel');
INSERT INTO timezones (name)
VALUES ('Jamaica');
INSERT INTO timezones (name)
VALUES ('Japan');
INSERT INTO timezones (name)
VALUES ('Kwajalein');
INSERT INTO timezones (name)
VALUES ('Libya');
INSERT INTO timezones (name)
VALUES ('MET');
INSERT INTO timezones (name)
VALUES ('Mexico/BajaNorte');
INSERT INTO timezones (name)
VALUES ('Mexico/BajaSur');
INSERT INTO timezones (name)
VALUES ('Mexico/General');
INSERT INTO timezones (name)
VALUES ('MST');
INSERT INTO timezones (name)
VALUES ('MST7MDT');
INSERT INTO timezones (name)
VALUES ('Navajo');
INSERT INTO timezones (name)
VALUES ('NZ');
INSERT INTO timezones (name)
VALUES ('NZ-CHAT');
INSERT INTO timezones (name)
VALUES ('Pacific/Apia');
INSERT INTO timezones (name)
VALUES ('Pacific/Auckland');
INSERT INTO timezones (name)
VALUES ('Pacific/Bougainville');
INSERT INTO timezones (name)
VALUES ('Pacific/Chatham');
INSERT INTO timezones (name)
VALUES ('Pacific/Chuuk');
INSERT INTO timezones (name)
VALUES ('Pacific/Easter');
INSERT INTO timezones (name)
VALUES ('Pacific/Efate');
INSERT INTO timezones (name)
VALUES ('Pacific/Enderbury');
INSERT INTO timezones (name)
VALUES ('Pacific/Fakaofo');
INSERT INTO timezones (name)
VALUES ('Pacific/Fiji');
INSERT INTO timezones (name)
VALUES ('Pacific/Funafuti');
INSERT INTO timezones (name)
VALUES ('Pacific/Galapagos');
INSERT INTO timezones (name)
VALUES ('Pacific/Gambier');
INSERT INTO timezones (name)
VALUES ('Pacific/Guadalcanal');
INSERT INTO timezones (name)
VALUES ('Pacific/Guam');
INSERT INTO timezones (name)
VALUES ('Pacific/Honolulu');
INSERT INTO timezones (name)
VALUES ('Pacific/Johnston');
INSERT INTO timezones (name)
VALUES ('Pacific/Kiritimati');
INSERT INTO timezones (name)
VALUES ('Pacific/Kosrae');
INSERT INTO timezones (name)
VALUES ('Pacific/Kwajalein');
INSERT INTO timezones (name)
VALUES ('Pacific/Majuro');
INSERT INTO timezones (name)
VALUES ('Pacific/Marquesas');
INSERT INTO timezones (name)
VALUES ('Pacific/Midway');
INSERT INTO timezones (name)
VALUES ('Pacific/Nauru');
INSERT INTO timezones (name)
VALUES ('Pacific/Niue');
INSERT INTO timezones (name)
VALUES ('Pacific/Norfolk');
INSERT INTO timezones (name)
VALUES ('Pacific/Noumea');
INSERT INTO timezones (name)
VALUES ('Pacific/Pago_Pago');
INSERT INTO timezones (name)
VALUES ('Pacific/Palau');
INSERT INTO timezones (name)
VALUES ('Pacific/Pitcairn');
INSERT INTO timezones (name)
VALUES ('Pacific/Pohnpei');
INSERT INTO timezones (name)
VALUES ('Pacific/Ponape');
INSERT INTO timezones (name)
VALUES ('Pacific/Port_Moresby');
INSERT INTO timezones (name)
VALUES ('Pacific/Rarotonga');
INSERT INTO timezones (name)
VALUES ('Pacific/Saipan');
INSERT INTO timezones (name)
VALUES ('Pacific/Samoa');
INSERT INTO timezones (name)
VALUES ('Pacific/Tahiti');
INSERT INTO timezones (name)
VALUES ('Pacific/Tarawa');
INSERT INTO timezones (name)
VALUES ('Pacific/Tongatapu');
INSERT INTO timezones (name)
VALUES ('Pacific/Truk');
INSERT INTO timezones (name)
VALUES ('Pacific/Wake');
INSERT INTO timezones (name)
VALUES ('Pacific/Wallis');
INSERT INTO timezones (name)
VALUES ('Pacific/Yap');
INSERT INTO timezones (name)
VALUES ('Poland');
INSERT INTO timezones (name)
VALUES ('Portugal');
INSERT INTO timezones (name)
VALUES ('PRC');
INSERT INTO timezones (name)
VALUES ('PST8PDT');
INSERT INTO timezones (name)
VALUES ('ROC');
INSERT INTO timezones (name)
VALUES ('ROK');
INSERT INTO timezones (name)
VALUES ('Singapore');
INSERT INTO timezones (name)
VALUES ('Turkey');
INSERT INTO timezones (name)
VALUES ('UCT');
INSERT INTO timezones (name)
VALUES ('Universal');
INSERT INTO timezones (name)
VALUES ('US/Alaska');
INSERT INTO timezones (name)
VALUES ('US/Aleutian');
INSERT INTO timezones (name)
VALUES ('US/Arizona');
INSERT INTO timezones (name)
VALUES ('US/Central');
INSERT INTO timezones (name)
VALUES ('US/Eastern');
INSERT INTO timezones (name)
VALUES ('US/East-Indiana');
INSERT INTO timezones (name)
VALUES ('US/Hawaii');
INSERT INTO timezones (name)
VALUES ('US/Indiana-Starke');
INSERT INTO timezones (name)
VALUES ('US/Michigan');
INSERT INTO timezones (name)
VALUES ('US/Mountain');
INSERT INTO timezones (name)
VALUES ('US/Pacific');
INSERT INTO timezones (name)
VALUES ('US/Pacific-New');
INSERT INTO timezones (name)
VALUES ('US/Samoa');
INSERT INTO timezones (name)
VALUES ('UTC');
INSERT INTO timezones (name)
VALUES ('WET');
INSERT INTO timezones (name)
VALUES ('W-SU');
INSERT INTO timezones (name)
VALUES ('Zulu');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM timezones WHERE id IS NOT NULL');
  }
}
