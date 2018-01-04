## S.M.A.R.T.Html




Подробно об установке и настройках: [https://github.com/gSpotx2f/smarthtml/wiki](https://github.com/gSpotx2f/smarthtml/wiki)

___________________


Описание.


S.M.A.R.T.Html - unix shell скрипт, предназначенный для мониторинга SMART-параметров жёстких дисков в ОС Linux. Скрипт создает html-страницу со списком SMART-атрибутов и отображает их изменения. Умеет рисовать графики с помощью rrdtool и отправлять email оповещения. Решение изначально создавалось для мониторинга USB-диска на маршрутизаторах Asus с прошивками от "энтузиастов" (http://wl500g.info) и Padavan'а (https://bitbucket.org/padavan/), а поэтому полностью совместимо с ash и awk из busybox...

___________________


Установка.


1. Установите smartmontools и rrdtool из репозитория Entware:

    opkg install smartmontools rrdtool


2. Скачайте smarthtml.sh в /opt/usr/bin/ и выполните chmod:

    mkdir -p /opt/usr/bin

    wget --no-check-certificate -O /opt/usr/bin/smarthtml.sh https://raw.githubusercontent.com/gSpotx2f/smarthtml/master/opt/usr/bin/smarthtml.sh

    chmod +x /opt/usr/bin/smarthtml.sh


3. Добавьте задание в cron (интервал обновления по умолчанию - 3 часа):

    10 */3 * * * /opt/usr/bin/smarthtml.sh


4. Опционально. Настройка CGI-модуля. Скачайте smarthtml.cgi в /opt/share/www/cgi-bin/ и выполните chmod:

    mkdir -p /opt/share/www/cgi-bin

    wget --no-check-certificate -O /opt/share/www/cgi-bin/smarthtml.cgi https://raw.githubusercontent.com/gSpotx2f/smarthtml/master/opt/share/www/cgi-bin/smarthtml.cgi

    chmod +x /opt/share/www/cgi-bin/smarthtml.cgi

 В smarthtml.sh установите переменную USE_CGI_MODULE=1. Веб-сервер должен быть настроен на выполнение .cgi сценариев с помощью /bin/sh.
 
___________________


Использование.


    smarthtml.sh              # запуск основной процедуры выполнения (запускается cron'ом по расписанию)
    smarthtml.sh resetwarn    # сброс предупреждения после изменения критического параметра
    smarthtml.sh resetcount   # сброс счётчиков изменений параметров
    smarthtml.sh makerrdgraph # только отрисовка графиков rrd без проверки SMART и без изменения данных
    smarthtml.sh mailtest     # отправка тестового email (в случае использования e-mail оповещений)




___________________

___________________





About.


S.M.A.R.T.Html is a unix-shell script for monitoring HDD health(S.M.A.R.T.) via smartctl with html-output, RRD support & email notifications.

___________________


Installation notes.


1. Install smartmontools and rrdtool from Entware repository:

    opkg install smartmontools rrdtool

2. Download the smarthtml.sh into /opt/usr/bin/ and run chmod:

    mkdir -p /opt/usr/bin

    wget --no-check-certificate -O /opt/usr/bin/smarthtml.sh https://raw.githubusercontent.com/gSpotx2f/smarthtml/master/opt/usr/bin/smarthtml.sh

    chmod +x /opt/usr/bin/smarthtml.sh


3. Make cron task (3 hours - default):

    10 */3 * * * /opt/usr/bin/smarthtml.sh


4. Optional. CGI-module. Download the smarthtml.cgi into /opt/share/www/cgi-bin/ and run chmod:

    mkdir -p /opt/share/www/cgi-bin

    wget --no-check-certificate -O /opt/share/www/cgi-bin/smarthtml.cgi https://raw.githubusercontent.com/gSpotx2f/smarthtml/master/opt/share/www/cgi-bin/smarthtml.cgi

    chmod +x /opt/share/www/cgi-bin/smarthtml.cgi

 Set USE_CGI_MODULE=1 in smarthtml.sh. Your web-server must execute .cgi scripts via /bin/sh.
 
___________________


Usage.


    smarthtml.sh              # regular run (cron)
    smarthtml.sh resetwarn    # reset warnings
    smarthtml.sh resetcount   # reset change counters
    smarthtml.sh makerrdgraph # call rrdtool graph (if USE_RRD=1)
    smarthtml.sh mailtest     # send the test email (if USE_MAIL=1)

