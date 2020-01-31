#!/bin/sh

########################################################################
#
# S.M.A.R.T.Html v1.0 (c) 2018
#
# Author:       gSpot <https://github.com/gSpotx2f/smarthtml>
# License:      GPLv3
# Depends:      smartmontools
# Recommends:   rrdtool, sendmail, openssl, sudo
#
########################################################################

############################## Settings ################################
CGI_USE_SUDO=0
CGI_SUDO_USER="admin"

############################# Base config ##############################
export NAME="smarthtml"
export PATH="/opt/bin:/opt/sbin:/opt/usr/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LANG="en_US.UTF-8"
export LANGUAGE="en"

### External config
CONFIG_FILE="/opt/etc/${NAME}.conf"
[ -f "$CONFIG_FILE" ] && . "$CONFIG_FILE"

SED_CMD="sed"
SMARTHTML_CMD="/opt/usr/bin/smarthtml.sh"

SUDOCMD=`which sudo`
if [ $CGI_USE_SUDO -eq 1 -a $? -eq 0 ]; then
    SMARTHTML_CMD="${SUDOCMD} -u ${CGI_SUDO_USER} ${SMARTHTML_CMD}"
fi

############################ Main section ##############################
eval `echo "${QUERY_STRING} " | $SED_CMD -e 's/[)(;\`\\]//g' -e 's/&/\; /g'`
printf "Content-type: text/html; charset=utf-8\n\n"

case $call in
    refresh)
        $SMARTHTML_CMD norrd
    ;;
    resetwarn)
        $SMARTHTML_CMD resetwarn && $SMARTHTML_CMD norrd
    ;;
    resetcount)
        $SMARTHTML_CMD resetcount && $SMARTHTML_CMD norrd
    ;;
    *)
        echo "Error! Wrong call (${call})..."
        exit 1
    ;;
esac

exit 0;
