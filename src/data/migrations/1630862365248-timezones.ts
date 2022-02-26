import { MigrationInterface, QueryRunner } from 'typeorm';

export class Timezones1630862365248 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
INSERT INTO public.timezones (name)
VALUES ('floating');
INSERT INTO public.timezones (name)
VALUES ('Africa/Abidjan');
INSERT INTO public.timezones (name)
VALUES ('Africa/Accra');
INSERT INTO public.timezones (name)
VALUES ('Africa/Addis_Ababa');
INSERT INTO public.timezones (name)
VALUES ('Africa/Algiers');
INSERT INTO public.timezones (name)
VALUES ('Africa/Asmara');
INSERT INTO public.timezones (name)
VALUES ('Africa/Bamako');
INSERT INTO public.timezones (name)
VALUES ('Africa/Bangui');
INSERT INTO public.timezones (name)
VALUES ('Africa/Banjul');
INSERT INTO public.timezones (name)
VALUES ('Africa/Bissau');
INSERT INTO public.timezones (name)
VALUES ('Africa/Blantyre');
INSERT INTO public.timezones (name)
VALUES ('Africa/Brazzaville');
INSERT INTO public.timezones (name)
VALUES ('Africa/Bujumbura');
INSERT INTO public.timezones (name)
VALUES ('Africa/Cairo');
INSERT INTO public.timezones (name)
VALUES ('Africa/Casablanca');
INSERT INTO public.timezones (name)
VALUES ('Africa/Ceuta');
INSERT INTO public.timezones (name)
VALUES ('Africa/Conakry');
INSERT INTO public.timezones (name)
VALUES ('Africa/Dakar');
INSERT INTO public.timezones (name)
VALUES ('Africa/Dar_es_Salaam');
INSERT INTO public.timezones (name)
VALUES ('Africa/Djibouti');
INSERT INTO public.timezones (name)
VALUES ('Africa/Douala');
INSERT INTO public.timezones (name)
VALUES ('Africa/El_Aaiun');
INSERT INTO public.timezones (name)
VALUES ('Africa/Freetown');
INSERT INTO public.timezones (name)
VALUES ('Africa/Gaborone');
INSERT INTO public.timezones (name)
VALUES ('Africa/Harare');
INSERT INTO public.timezones (name)
VALUES ('Africa/Johannesburg');
INSERT INTO public.timezones (name)
VALUES ('Africa/Juba');
INSERT INTO public.timezones (name)
VALUES ('Africa/Kampala');
INSERT INTO public.timezones (name)
VALUES ('Africa/Khartoum');
INSERT INTO public.timezones (name)
VALUES ('Africa/Kigali');
INSERT INTO public.timezones (name)
VALUES ('Africa/Kinshasa');
INSERT INTO public.timezones (name)
VALUES ('Africa/Lagos');
INSERT INTO public.timezones (name)
VALUES ('Africa/Libreville');
INSERT INTO public.timezones (name)
VALUES ('Africa/Lome');
INSERT INTO public.timezones (name)
VALUES ('Africa/Luanda');
INSERT INTO public.timezones (name)
VALUES ('Africa/Lubumbashi');
INSERT INTO public.timezones (name)
VALUES ('Africa/Lusaka');
INSERT INTO public.timezones (name)
VALUES ('Africa/Malabo');
INSERT INTO public.timezones (name)
VALUES ('Africa/Maputo');
INSERT INTO public.timezones (name)
VALUES ('Africa/Maseru');
INSERT INTO public.timezones (name)
VALUES ('Africa/Mbabane');
INSERT INTO public.timezones (name)
VALUES ('Africa/Mogadishu');
INSERT INTO public.timezones (name)
VALUES ('Africa/Monrovia');
INSERT INTO public.timezones (name)
VALUES ('Africa/Nairobi');
INSERT INTO public.timezones (name)
VALUES ('Africa/Ndjamena');
INSERT INTO public.timezones (name)
VALUES ('Africa/Niamey');
INSERT INTO public.timezones (name)
VALUES ('Africa/Nouakchott');
INSERT INTO public.timezones (name)
VALUES ('Africa/Ouagadougou');
INSERT INTO public.timezones (name)
VALUES ('Africa/Porto-Novo');
INSERT INTO public.timezones (name)
VALUES ('Africa/Sao_Tome');
INSERT INTO public.timezones (name)
VALUES ('Africa/Timbuktu');
INSERT INTO public.timezones (name)
VALUES ('Africa/Tripoli');
INSERT INTO public.timezones (name)
VALUES ('Africa/Tunis');
INSERT INTO public.timezones (name)
VALUES ('Africa/Windhoek');
INSERT INTO public.timezones (name)
VALUES ('America/Adak');
INSERT INTO public.timezones (name)
VALUES ('America/Anchorage');
INSERT INTO public.timezones (name)
VALUES ('America/Anguilla');
INSERT INTO public.timezones (name)
VALUES ('America/Antigua');
INSERT INTO public.timezones (name)
VALUES ('America/Araguaina');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Buenos_Aires');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Catamarca');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/ComodRivadavia');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Cordoba');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Jujuy');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/La_Rioja');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Mendoza');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Rio_Gallegos');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Salta');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/San_Juan');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/San_Luis');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Tucuman');
INSERT INTO public.timezones (name)
VALUES ('America/Argentina/Ushuaia');
INSERT INTO public.timezones (name)
VALUES ('America/Aruba');
INSERT INTO public.timezones (name)
VALUES ('America/Asuncion');
INSERT INTO public.timezones (name)
VALUES ('America/Atikokan');
INSERT INTO public.timezones (name)
VALUES ('America/Atka');
INSERT INTO public.timezones (name)
VALUES ('America/Bahia');
INSERT INTO public.timezones (name)
VALUES ('America/Bahia_Banderas');
INSERT INTO public.timezones (name)
VALUES ('America/Barbados');
INSERT INTO public.timezones (name)
VALUES ('America/Belem');
INSERT INTO public.timezones (name)
VALUES ('America/Belize');
INSERT INTO public.timezones (name)
VALUES ('America/Blanc-Sablon');
INSERT INTO public.timezones (name)
VALUES ('America/Boa_Vista');
INSERT INTO public.timezones (name)
VALUES ('America/Bogota');
INSERT INTO public.timezones (name)
VALUES ('America/Boise');
INSERT INTO public.timezones (name)
VALUES ('America/Buenos_Aires');
INSERT INTO public.timezones (name)
VALUES ('America/Cambridge_Bay');
INSERT INTO public.timezones (name)
VALUES ('America/Campo_Grande');
INSERT INTO public.timezones (name)
VALUES ('America/Cancun');
INSERT INTO public.timezones (name)
VALUES ('America/Caracas');
INSERT INTO public.timezones (name)
VALUES ('America/Catamarca');
INSERT INTO public.timezones (name)
VALUES ('America/Cayenne');
INSERT INTO public.timezones (name)
VALUES ('America/Cayman');
INSERT INTO public.timezones (name)
VALUES ('America/Chicago');
INSERT INTO public.timezones (name)
VALUES ('America/Chihuahua');
INSERT INTO public.timezones (name)
VALUES ('America/Coral_Harbour');
INSERT INTO public.timezones (name)
VALUES ('America/Cordoba');
INSERT INTO public.timezones (name)
VALUES ('America/Costa_Rica');
INSERT INTO public.timezones (name)
VALUES ('America/Creston');
INSERT INTO public.timezones (name)
VALUES ('America/Cuiaba');
INSERT INTO public.timezones (name)
VALUES ('America/Curacao');
INSERT INTO public.timezones (name)
VALUES ('America/Danmarkshavn');
INSERT INTO public.timezones (name)
VALUES ('America/Dawson');
INSERT INTO public.timezones (name)
VALUES ('America/Dawson_Creek');
INSERT INTO public.timezones (name)
VALUES ('America/Denver');
INSERT INTO public.timezones (name)
VALUES ('America/Detroit');
INSERT INTO public.timezones (name)
VALUES ('America/Dominica');
INSERT INTO public.timezones (name)
VALUES ('America/Edmonton');
INSERT INTO public.timezones (name)
VALUES ('America/Eirunepe');
INSERT INTO public.timezones (name)
VALUES ('America/El_Salvador');
INSERT INTO public.timezones (name)
VALUES ('America/Ensenada');
INSERT INTO public.timezones (name)
VALUES ('America/Fort_Nelson');
INSERT INTO public.timezones (name)
VALUES ('America/Fort_Wayne');
INSERT INTO public.timezones (name)
VALUES ('America/Fortaleza');
INSERT INTO public.timezones (name)
VALUES ('America/Glace_Bay');
INSERT INTO public.timezones (name)
VALUES ('America/Godthab');
INSERT INTO public.timezones (name)
VALUES ('America/Goose_Bay');
INSERT INTO public.timezones (name)
VALUES ('America/Grand_Turk');
INSERT INTO public.timezones (name)
VALUES ('America/Grenada');
INSERT INTO public.timezones (name)
VALUES ('America/Guadeloupe');
INSERT INTO public.timezones (name)
VALUES ('America/Guatemala');
INSERT INTO public.timezones (name)
VALUES ('America/Guayaquil');
INSERT INTO public.timezones (name)
VALUES ('America/Guyana');
INSERT INTO public.timezones (name)
VALUES ('America/Halifax');
INSERT INTO public.timezones (name)
VALUES ('America/Havana');
INSERT INTO public.timezones (name)
VALUES ('America/Hermosillo');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Indianapolis');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Knox');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Marengo');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Petersburg');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Tell_City');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Vevay');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Vincennes');
INSERT INTO public.timezones (name)
VALUES ('America/Indiana/Winamac');
INSERT INTO public.timezones (name)
VALUES ('America/Indianapolis');
INSERT INTO public.timezones (name)
VALUES ('America/Inuvik');
INSERT INTO public.timezones (name)
VALUES ('America/Iqaluit');
INSERT INTO public.timezones (name)
VALUES ('America/Jamaica');
INSERT INTO public.timezones (name)
VALUES ('America/Jujuy');
INSERT INTO public.timezones (name)
VALUES ('America/Juneau');
INSERT INTO public.timezones (name)
VALUES ('America/Kentucky/Louisville');
INSERT INTO public.timezones (name)
VALUES ('America/Kentucky/Monticello');
INSERT INTO public.timezones (name)
VALUES ('America/Knox_IN');
INSERT INTO public.timezones (name)
VALUES ('America/Kralendijk');
INSERT INTO public.timezones (name)
VALUES ('America/La_Paz');
INSERT INTO public.timezones (name)
VALUES ('America/Lima');
INSERT INTO public.timezones (name)
VALUES ('America/Los_Angeles');
INSERT INTO public.timezones (name)
VALUES ('America/Louisville');
INSERT INTO public.timezones (name)
VALUES ('America/Lower_Princes');
INSERT INTO public.timezones (name)
VALUES ('America/Maceio');
INSERT INTO public.timezones (name)
VALUES ('America/Managua');
INSERT INTO public.timezones (name)
VALUES ('America/Manaus');
INSERT INTO public.timezones (name)
VALUES ('America/Marigot');
INSERT INTO public.timezones (name)
VALUES ('America/Martinique');
INSERT INTO public.timezones (name)
VALUES ('America/Matamoros');
INSERT INTO public.timezones (name)
VALUES ('America/Mazatlan');
INSERT INTO public.timezones (name)
VALUES ('America/Mendoza');
INSERT INTO public.timezones (name)
VALUES ('America/Menominee');
INSERT INTO public.timezones (name)
VALUES ('America/Merida');
INSERT INTO public.timezones (name)
VALUES ('America/Metlakatla');
INSERT INTO public.timezones (name)
VALUES ('America/Mexico_City');
INSERT INTO public.timezones (name)
VALUES ('America/Miquelon');
INSERT INTO public.timezones (name)
VALUES ('America/Moncton');
INSERT INTO public.timezones (name)
VALUES ('America/Monterrey');
INSERT INTO public.timezones (name)
VALUES ('America/Montevideo');
INSERT INTO public.timezones (name)
VALUES ('America/Montreal');
INSERT INTO public.timezones (name)
VALUES ('America/Montserrat');
INSERT INTO public.timezones (name)
VALUES ('America/Nassau');
INSERT INTO public.timezones (name)
VALUES ('America/New_York');
INSERT INTO public.timezones (name)
VALUES ('America/Nipigon');
INSERT INTO public.timezones (name)
VALUES ('America/Nome');
INSERT INTO public.timezones (name)
VALUES ('America/Noronha');
INSERT INTO public.timezones (name)
VALUES ('America/North_Dakota/Beulah');
INSERT INTO public.timezones (name)
VALUES ('America/North_Dakota/Center');
INSERT INTO public.timezones (name)
VALUES ('America/North_Dakota/New_Salem');
INSERT INTO public.timezones (name)
VALUES ('America/Ojinaga');
INSERT INTO public.timezones (name)
VALUES ('America/Panama');
INSERT INTO public.timezones (name)
VALUES ('America/Pangnirtung');
INSERT INTO public.timezones (name)
VALUES ('America/Paramaribo');
INSERT INTO public.timezones (name)
VALUES ('America/Phoenix');
INSERT INTO public.timezones (name)
VALUES ('America/Port_of_Spain');
INSERT INTO public.timezones (name)
VALUES ('America/Port-au-Prince');
INSERT INTO public.timezones (name)
VALUES ('America/Porto_Acre');
INSERT INTO public.timezones (name)
VALUES ('America/Porto_Velho');
INSERT INTO public.timezones (name)
VALUES ('America/Puerto_Rico');
INSERT INTO public.timezones (name)
VALUES ('America/Punta_Arenas');
INSERT INTO public.timezones (name)
VALUES ('America/Rainy_River');
INSERT INTO public.timezones (name)
VALUES ('America/Rankin_Inlet');
INSERT INTO public.timezones (name)
VALUES ('America/Recife');
INSERT INTO public.timezones (name)
VALUES ('America/Regina');
INSERT INTO public.timezones (name)
VALUES ('America/Resolute');
INSERT INTO public.timezones (name)
VALUES ('America/Rio_Branco');
INSERT INTO public.timezones (name)
VALUES ('America/Rosario');
INSERT INTO public.timezones (name)
VALUES ('America/Santa_Isabel');
INSERT INTO public.timezones (name)
VALUES ('America/Santarem');
INSERT INTO public.timezones (name)
VALUES ('America/Santiago');
INSERT INTO public.timezones (name)
VALUES ('America/Santo_Domingo');
INSERT INTO public.timezones (name)
VALUES ('America/Sao_Paulo');
INSERT INTO public.timezones (name)
VALUES ('America/Scoresbysund');
INSERT INTO public.timezones (name)
VALUES ('America/Shiprock');
INSERT INTO public.timezones (name)
VALUES ('America/Sitka');
INSERT INTO public.timezones (name)
VALUES ('America/St_Barthelemy');
INSERT INTO public.timezones (name)
VALUES ('America/St_Johns');
INSERT INTO public.timezones (name)
VALUES ('America/St_Kitts');
INSERT INTO public.timezones (name)
VALUES ('America/St_Lucia');
INSERT INTO public.timezones (name)
VALUES ('America/St_Thomas');
INSERT INTO public.timezones (name)
VALUES ('America/St_Vincent');
INSERT INTO public.timezones (name)
VALUES ('America/Swift_Current');
INSERT INTO public.timezones (name)
VALUES ('America/Tegucigalpa');
INSERT INTO public.timezones (name)
VALUES ('America/Thule');
INSERT INTO public.timezones (name)
VALUES ('America/Thunder_Bay');
INSERT INTO public.timezones (name)
VALUES ('America/Tijuana');
INSERT INTO public.timezones (name)
VALUES ('America/Toronto');
INSERT INTO public.timezones (name)
VALUES ('America/Tortola');
INSERT INTO public.timezones (name)
VALUES ('America/Vancouver');
INSERT INTO public.timezones (name)
VALUES ('America/Virgin');
INSERT INTO public.timezones (name)
VALUES ('America/Whitehorse');
INSERT INTO public.timezones (name)
VALUES ('America/Winnipeg');
INSERT INTO public.timezones (name)
VALUES ('America/Yakutat');
INSERT INTO public.timezones (name)
VALUES ('America/Yellowknife');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Casey');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Davis');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/DumontDUrville');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Macquarie');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Mawson');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/McMurdo');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Palmer');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Rothera');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/South_Pole');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Syowa');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Troll');
INSERT INTO public.timezones (name)
VALUES ('Antarctica/Vostok');
INSERT INTO public.timezones (name)
VALUES ('Arctic/Longyearbyen');
INSERT INTO public.timezones (name)
VALUES ('Asia/Aden');
INSERT INTO public.timezones (name)
VALUES ('Asia/Almaty');
INSERT INTO public.timezones (name)
VALUES ('Asia/Amman');
INSERT INTO public.timezones (name)
VALUES ('Asia/Anadyr');
INSERT INTO public.timezones (name)
VALUES ('Asia/Aqtau');
INSERT INTO public.timezones (name)
VALUES ('Asia/Aqtobe');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ashgabat');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ashkhabad');
INSERT INTO public.timezones (name)
VALUES ('Asia/Atyrau');
INSERT INTO public.timezones (name)
VALUES ('Asia/Baghdad');
INSERT INTO public.timezones (name)
VALUES ('Asia/Bahrain');
INSERT INTO public.timezones (name)
VALUES ('Asia/Baku');
INSERT INTO public.timezones (name)
VALUES ('Asia/Bangkok');
INSERT INTO public.timezones (name)
VALUES ('Asia/Barnaul');
INSERT INTO public.timezones (name)
VALUES ('Asia/Beirut');
INSERT INTO public.timezones (name)
VALUES ('Asia/Bishkek');
INSERT INTO public.timezones (name)
VALUES ('Asia/Brunei');
INSERT INTO public.timezones (name)
VALUES ('Asia/Calcutta');
INSERT INTO public.timezones (name)
VALUES ('Asia/Chita');
INSERT INTO public.timezones (name)
VALUES ('Asia/Choibalsan');
INSERT INTO public.timezones (name)
VALUES ('Asia/Chongqing');
INSERT INTO public.timezones (name)
VALUES ('Asia/Chungking');
INSERT INTO public.timezones (name)
VALUES ('Asia/Colombo');
INSERT INTO public.timezones (name)
VALUES ('Asia/Dacca');
INSERT INTO public.timezones (name)
VALUES ('Asia/Damascus');
INSERT INTO public.timezones (name)
VALUES ('Asia/Dhaka');
INSERT INTO public.timezones (name)
VALUES ('Asia/Dili');
INSERT INTO public.timezones (name)
VALUES ('Asia/Dubai');
INSERT INTO public.timezones (name)
VALUES ('Asia/Dushanbe');
INSERT INTO public.timezones (name)
VALUES ('Asia/Famagusta');
INSERT INTO public.timezones (name)
VALUES ('Asia/Gaza');
INSERT INTO public.timezones (name)
VALUES ('Asia/Harbin');
INSERT INTO public.timezones (name)
VALUES ('Asia/Hebron');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ho_Chi_Minh');
INSERT INTO public.timezones (name)
VALUES ('Asia/Hong_Kong');
INSERT INTO public.timezones (name)
VALUES ('Asia/Hovd');
INSERT INTO public.timezones (name)
VALUES ('Asia/Irkutsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Istanbul');
INSERT INTO public.timezones (name)
VALUES ('Asia/Jakarta');
INSERT INTO public.timezones (name)
VALUES ('Asia/Jayapura');
INSERT INTO public.timezones (name)
VALUES ('Asia/Jerusalem');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kabul');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kamchatka');
INSERT INTO public.timezones (name)
VALUES ('Asia/Karachi');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kashgar');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kathmandu');
INSERT INTO public.timezones (name)
VALUES ('Asia/Katmandu');
INSERT INTO public.timezones (name)
VALUES ('Asia/Khandyga');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kolkata');
INSERT INTO public.timezones (name)
VALUES ('Asia/Krasnoyarsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kuala_Lumpur');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kuching');
INSERT INTO public.timezones (name)
VALUES ('Asia/Kuwait');
INSERT INTO public.timezones (name)
VALUES ('Asia/Macao');
INSERT INTO public.timezones (name)
VALUES ('Asia/Macau');
INSERT INTO public.timezones (name)
VALUES ('Asia/Magadan');
INSERT INTO public.timezones (name)
VALUES ('Asia/Makassar');
INSERT INTO public.timezones (name)
VALUES ('Asia/Manila');
INSERT INTO public.timezones (name)
VALUES ('Asia/Muscat');
INSERT INTO public.timezones (name)
VALUES ('Asia/Novokuznetsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Novosibirsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Omsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Oral');
INSERT INTO public.timezones (name)
VALUES ('Asia/Phnom_Penh');
INSERT INTO public.timezones (name)
VALUES ('Asia/Pontianak');
INSERT INTO public.timezones (name)
VALUES ('Asia/Pyongyang');
INSERT INTO public.timezones (name)
VALUES ('Asia/Qatar');
INSERT INTO public.timezones (name)
VALUES ('Asia/Qyzylorda');
INSERT INTO public.timezones (name)
VALUES ('Asia/Rangoon');
INSERT INTO public.timezones (name)
VALUES ('Asia/Riyadh');
INSERT INTO public.timezones (name)
VALUES ('Asia/Saigon');
INSERT INTO public.timezones (name)
VALUES ('Asia/Sakhalin');
INSERT INTO public.timezones (name)
VALUES ('Asia/Samarkand');
INSERT INTO public.timezones (name)
VALUES ('Asia/Seoul');
INSERT INTO public.timezones (name)
VALUES ('Asia/Shanghai');
INSERT INTO public.timezones (name)
VALUES ('Asia/Singapore');
INSERT INTO public.timezones (name)
VALUES ('Asia/Srednekolymsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Taipei');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tashkent');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tbilisi');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tehran');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tel_Aviv');
INSERT INTO public.timezones (name)
VALUES ('Asia/Thimbu');
INSERT INTO public.timezones (name)
VALUES ('Asia/Thimphu');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tokyo');
INSERT INTO public.timezones (name)
VALUES ('Asia/Tomsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ujung_Pandang');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ulaanbaatar');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ulan_Bator');
INSERT INTO public.timezones (name)
VALUES ('Asia/Urumqi');
INSERT INTO public.timezones (name)
VALUES ('Asia/Ust-Nera');
INSERT INTO public.timezones (name)
VALUES ('Asia/Vientiane');
INSERT INTO public.timezones (name)
VALUES ('Asia/Vladivostok');
INSERT INTO public.timezones (name)
VALUES ('Asia/Yakutsk');
INSERT INTO public.timezones (name)
VALUES ('Asia/Yangon');
INSERT INTO public.timezones (name)
VALUES ('Asia/Yekaterinburg');
INSERT INTO public.timezones (name)
VALUES ('Asia/Yerevan');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Azores');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Bermuda');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Canary');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Cape_Verde');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Faeroe');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Faroe');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Jan_Mayen');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Madeira');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Reykjavik');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/South_Georgia');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/St_Helena');
INSERT INTO public.timezones (name)
VALUES ('Atlantic/Stanley');
INSERT INTO public.timezones (name)
VALUES ('Australia/ACT');
INSERT INTO public.timezones (name)
VALUES ('Australia/Adelaide');
INSERT INTO public.timezones (name)
VALUES ('Australia/Brisbane');
INSERT INTO public.timezones (name)
VALUES ('Australia/Broken_Hill');
INSERT INTO public.timezones (name)
VALUES ('Australia/Canberra');
INSERT INTO public.timezones (name)
VALUES ('Australia/Currie');
INSERT INTO public.timezones (name)
VALUES ('Australia/Darwin');
INSERT INTO public.timezones (name)
VALUES ('Australia/Eucla');
INSERT INTO public.timezones (name)
VALUES ('Australia/Hobart');
INSERT INTO public.timezones (name)
VALUES ('Australia/LHI');
INSERT INTO public.timezones (name)
VALUES ('Australia/Lindeman');
INSERT INTO public.timezones (name)
VALUES ('Australia/Lord_Howe');
INSERT INTO public.timezones (name)
VALUES ('Australia/Melbourne');
INSERT INTO public.timezones (name)
VALUES ('Australia/North');
INSERT INTO public.timezones (name)
VALUES ('Australia/NSW');
INSERT INTO public.timezones (name)
VALUES ('Australia/Perth');
INSERT INTO public.timezones (name)
VALUES ('Australia/Queensland');
INSERT INTO public.timezones (name)
VALUES ('Australia/South');
INSERT INTO public.timezones (name)
VALUES ('Australia/Sydney');
INSERT INTO public.timezones (name)
VALUES ('Australia/Tasmania');
INSERT INTO public.timezones (name)
VALUES ('Australia/Victoria');
INSERT INTO public.timezones (name)
VALUES ('Australia/West');
INSERT INTO public.timezones (name)
VALUES ('Australia/Yancowinna');
INSERT INTO public.timezones (name)
VALUES ('Brazil/Acre');
INSERT INTO public.timezones (name)
VALUES ('Brazil/DeNoronha');
INSERT INTO public.timezones (name)
VALUES ('Brazil/East');
INSERT INTO public.timezones (name)
VALUES ('Brazil/West');
INSERT INTO public.timezones (name)
VALUES ('Canada/Atlantic');
INSERT INTO public.timezones (name)
VALUES ('Canada/Central');
INSERT INTO public.timezones (name)
VALUES ('Canada/Eastern');
INSERT INTO public.timezones (name)
VALUES ('Canada/Mountain');
INSERT INTO public.timezones (name)
VALUES ('Canada/Newfoundland');
INSERT INTO public.timezones (name)
VALUES ('Canada/Pacific');
INSERT INTO public.timezones (name)
VALUES ('Canada/Saskatchewan');
INSERT INTO public.timezones (name)
VALUES ('Canada/Yukon');
INSERT INTO public.timezones (name)
VALUES ('CET');
INSERT INTO public.timezones (name)
VALUES ('Chile/Continental');
INSERT INTO public.timezones (name)
VALUES ('Chile/EasterIsland');
INSERT INTO public.timezones (name)
VALUES ('CST6CDT');
INSERT INTO public.timezones (name)
VALUES ('Cuba');
INSERT INTO public.timezones (name)
VALUES ('EET');
INSERT INTO public.timezones (name)
VALUES ('Egypt');
INSERT INTO public.timezones (name)
VALUES ('Eire');
INSERT INTO public.timezones (name)
VALUES ('EST');
INSERT INTO public.timezones (name)
VALUES ('EST5EDT');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+0');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+1');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+10');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+11');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+12');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+2');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+3');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+4');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+5');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+6');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+7');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+8');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT+9');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT0');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-0');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-1');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-10');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-11');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-12');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-13');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-14');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-2');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-3');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-4');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-5');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-6');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-7');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-8');
INSERT INTO public.timezones (name)
VALUES ('Etc/GMT-9');
INSERT INTO public.timezones (name)
VALUES ('Etc/Greenwich');
INSERT INTO public.timezones (name)
VALUES ('Etc/UCT');
INSERT INTO public.timezones (name)
VALUES ('Etc/Universal');
INSERT INTO public.timezones (name)
VALUES ('Etc/UTC');
INSERT INTO public.timezones (name)
VALUES ('Etc/Zulu');
INSERT INTO public.timezones (name)
VALUES ('Europe/Amsterdam');
INSERT INTO public.timezones (name)
VALUES ('Europe/Andorra');
INSERT INTO public.timezones (name)
VALUES ('Europe/Astrakhan');
INSERT INTO public.timezones (name)
VALUES ('Europe/Athens');
INSERT INTO public.timezones (name)
VALUES ('Europe/Belfast');
INSERT INTO public.timezones (name)
VALUES ('Europe/Belgrade');
INSERT INTO public.timezones (name)
VALUES ('Europe/Berlin');
INSERT INTO public.timezones (name)
VALUES ('Europe/Bratislava');
INSERT INTO public.timezones (name)
VALUES ('Europe/Brussels');
INSERT INTO public.timezones (name)
VALUES ('Europe/Bucharest');
INSERT INTO public.timezones (name)
VALUES ('Europe/Budapest');
INSERT INTO public.timezones (name)
VALUES ('Europe/Busingen');
INSERT INTO public.timezones (name)
VALUES ('Europe/Chisinau');
INSERT INTO public.timezones (name)
VALUES ('Europe/Copenhagen');
INSERT INTO public.timezones (name)
VALUES ('Europe/Dublin');
INSERT INTO public.timezones (name)
VALUES ('Europe/Gibraltar');
INSERT INTO public.timezones (name)
VALUES ('Europe/Guernsey');
INSERT INTO public.timezones (name)
VALUES ('Europe/Helsinki');
INSERT INTO public.timezones (name)
VALUES ('Europe/Isle_of_Man');
INSERT INTO public.timezones (name)
VALUES ('Europe/Istanbul');
INSERT INTO public.timezones (name)
VALUES ('Europe/Jersey');
INSERT INTO public.timezones (name)
VALUES ('Europe/Kaliningrad');
INSERT INTO public.timezones (name)
VALUES ('Europe/Kiev');
INSERT INTO public.timezones (name)
VALUES ('Europe/Kirov');
INSERT INTO public.timezones (name)
VALUES ('Europe/Lisbon');
INSERT INTO public.timezones (name)
VALUES ('Europe/Ljubljana');
INSERT INTO public.timezones (name)
VALUES ('Europe/London');
INSERT INTO public.timezones (name)
VALUES ('Europe/Luxembourg');
INSERT INTO public.timezones (name)
VALUES ('Europe/Madrid');
INSERT INTO public.timezones (name)
VALUES ('Europe/Malta');
INSERT INTO public.timezones (name)
VALUES ('Europe/Mariehamn');
INSERT INTO public.timezones (name)
VALUES ('Europe/Minsk');
INSERT INTO public.timezones (name)
VALUES ('Europe/Monaco');
INSERT INTO public.timezones (name)
VALUES ('Europe/Moscow');
INSERT INTO public.timezones (name)
VALUES ('Asia/Nicosia');
INSERT INTO public.timezones (name)
VALUES ('Europe/Oslo');
INSERT INTO public.timezones (name)
VALUES ('Europe/Paris');
INSERT INTO public.timezones (name)
VALUES ('Europe/Podgorica');
INSERT INTO public.timezones (name)
VALUES ('Europe/Prague');
INSERT INTO public.timezones (name)
VALUES ('Europe/Riga');
INSERT INTO public.timezones (name)
VALUES ('Europe/Rome');
INSERT INTO public.timezones (name)
VALUES ('Europe/Samara');
INSERT INTO public.timezones (name)
VALUES ('Europe/San_Marino');
INSERT INTO public.timezones (name)
VALUES ('Europe/Sarajevo');
INSERT INTO public.timezones (name)
VALUES ('Europe/Saratov');
INSERT INTO public.timezones (name)
VALUES ('Europe/Simferopol');
INSERT INTO public.timezones (name)
VALUES ('Europe/Skopje');
INSERT INTO public.timezones (name)
VALUES ('Europe/Sofia');
INSERT INTO public.timezones (name)
VALUES ('Europe/Stockholm');
INSERT INTO public.timezones (name)
VALUES ('Europe/Tallinn');
INSERT INTO public.timezones (name)
VALUES ('Europe/Tirane');
INSERT INTO public.timezones (name)
VALUES ('Europe/Tiraspol');
INSERT INTO public.timezones (name)
VALUES ('Europe/Ulyanovsk');
INSERT INTO public.timezones (name)
VALUES ('Europe/Uzhgorod');
INSERT INTO public.timezones (name)
VALUES ('Europe/Vaduz');
INSERT INTO public.timezones (name)
VALUES ('Europe/Vatican');
INSERT INTO public.timezones (name)
VALUES ('Europe/Vienna');
INSERT INTO public.timezones (name)
VALUES ('Europe/Vilnius');
INSERT INTO public.timezones (name)
VALUES ('Europe/Volgograd');
INSERT INTO public.timezones (name)
VALUES ('Europe/Warsaw');
INSERT INTO public.timezones (name)
VALUES ('Europe/Zagreb');
INSERT INTO public.timezones (name)
VALUES ('Europe/Zaporozhye');
INSERT INTO public.timezones (name)
VALUES ('Europe/Zurich');
INSERT INTO public.timezones (name)
VALUES ('GB');
INSERT INTO public.timezones (name)
VALUES ('GB-Eire');
INSERT INTO public.timezones (name)
VALUES ('GMT');
INSERT INTO public.timezones (name)
VALUES ('GMT+0');
INSERT INTO public.timezones (name)
VALUES ('GMT0');
INSERT INTO public.timezones (name)
VALUES ('GMT−0');
INSERT INTO public.timezones (name)
VALUES ('Greenwich');
INSERT INTO public.timezones (name)
VALUES ('Hongkong');
INSERT INTO public.timezones (name)
VALUES ('HST');
INSERT INTO public.timezones (name)
VALUES ('Iceland');
INSERT INTO public.timezones (name)
VALUES ('Indian/Antananarivo');
INSERT INTO public.timezones (name)
VALUES ('Indian/Chagos');
INSERT INTO public.timezones (name)
VALUES ('Indian/Christmas');
INSERT INTO public.timezones (name)
VALUES ('Indian/Cocos');
INSERT INTO public.timezones (name)
VALUES ('Indian/Comoro');
INSERT INTO public.timezones (name)
VALUES ('Indian/Kerguelen');
INSERT INTO public.timezones (name)
VALUES ('Indian/Mahe');
INSERT INTO public.timezones (name)
VALUES ('Indian/Maldives');
INSERT INTO public.timezones (name)
VALUES ('Indian/Mauritius');
INSERT INTO public.timezones (name)
VALUES ('Indian/Mayotte');
INSERT INTO public.timezones (name)
VALUES ('Indian/Reunion');
INSERT INTO public.timezones (name)
VALUES ('Iran');
INSERT INTO public.timezones (name)
VALUES ('Israel');
INSERT INTO public.timezones (name)
VALUES ('Jamaica');
INSERT INTO public.timezones (name)
VALUES ('Japan');
INSERT INTO public.timezones (name)
VALUES ('Kwajalein');
INSERT INTO public.timezones (name)
VALUES ('Libya');
INSERT INTO public.timezones (name)
VALUES ('MET');
INSERT INTO public.timezones (name)
VALUES ('Mexico/BajaNorte');
INSERT INTO public.timezones (name)
VALUES ('Mexico/BajaSur');
INSERT INTO public.timezones (name)
VALUES ('Mexico/General');
INSERT INTO public.timezones (name)
VALUES ('MST');
INSERT INTO public.timezones (name)
VALUES ('MST7MDT');
INSERT INTO public.timezones (name)
VALUES ('Navajo');
INSERT INTO public.timezones (name)
VALUES ('NZ');
INSERT INTO public.timezones (name)
VALUES ('NZ-CHAT');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Apia');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Auckland');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Bougainville');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Chatham');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Chuuk');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Easter');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Efate');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Enderbury');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Fakaofo');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Fiji');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Funafuti');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Galapagos');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Gambier');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Guadalcanal');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Guam');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Honolulu');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Johnston');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Kiritimati');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Kosrae');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Kwajalein');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Majuro');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Marquesas');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Midway');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Nauru');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Niue');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Norfolk');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Noumea');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Pago_Pago');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Palau');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Pitcairn');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Pohnpei');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Ponape');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Port_Moresby');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Rarotonga');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Saipan');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Samoa');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Tahiti');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Tarawa');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Tongatapu');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Truk');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Wake');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Wallis');
INSERT INTO public.timezones (name)
VALUES ('Pacific/Yap');
INSERT INTO public.timezones (name)
VALUES ('Poland');
INSERT INTO public.timezones (name)
VALUES ('Portugal');
INSERT INTO public.timezones (name)
VALUES ('PRC');
INSERT INTO public.timezones (name)
VALUES ('PST8PDT');
INSERT INTO public.timezones (name)
VALUES ('ROC');
INSERT INTO public.timezones (name)
VALUES ('ROK');
INSERT INTO public.timezones (name)
VALUES ('Singapore');
INSERT INTO public.timezones (name)
VALUES ('Turkey');
INSERT INTO public.timezones (name)
VALUES ('UCT');
INSERT INTO public.timezones (name)
VALUES ('Universal');
INSERT INTO public.timezones (name)
VALUES ('US/Alaska');
INSERT INTO public.timezones (name)
VALUES ('US/Aleutian');
INSERT INTO public.timezones (name)
VALUES ('US/Arizona');
INSERT INTO public.timezones (name)
VALUES ('US/Central');
INSERT INTO public.timezones (name)
VALUES ('US/Eastern');
INSERT INTO public.timezones (name)
VALUES ('US/East-Indiana');
INSERT INTO public.timezones (name)
VALUES ('US/Hawaii');
INSERT INTO public.timezones (name)
VALUES ('US/Indiana-Starke');
INSERT INTO public.timezones (name)
VALUES ('US/Michigan');
INSERT INTO public.timezones (name)
VALUES ('US/Mountain');
INSERT INTO public.timezones (name)
VALUES ('US/Pacific');
INSERT INTO public.timezones (name)
VALUES ('US/Pacific-New');
INSERT INTO public.timezones (name)
VALUES ('US/Samoa');
INSERT INTO public.timezones (name)
VALUES ('UTC');
INSERT INTO public.timezones (name)
VALUES ('WET');
INSERT INTO public.timezones (name)
VALUES ('W-SU');
INSERT INTO public.timezones (name)
VALUES ('Zulu');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM timezones WHERE id IS NOT NULL');
  }
}
