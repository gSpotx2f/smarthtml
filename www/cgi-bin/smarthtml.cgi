#!/bin/sh

###############################################################################
#
# S.M.A.R.T.Html v2.0
#
# (c) 2020 gSpot (https://github.com/gSpotx2f/smarthtml)
#
###############################################################################

export PATH="/opt/bin:/opt/sbin:/opt/usr/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export NAME="smarthtml"
export LANG="en_US.UTF-8"
export LANGUAGE="en"

####################### Platform-specific settings ############################

### External config
CONFIG_FILE="/opt/etc/${NAME}.conf"
CGI_SMARTHTML_CMD="/opt/usr/bin/${NAME}"

############################ Default settings #################################

CGI_USE_SUDO=0
CGI_SUDO_USER="admin"

############################### Configuration #################################

[ -f "$CONFIG_FILE" ] && . "$CONFIG_FILE"

SED_CMD="sed"
SUDOCMD=`which sudo`
if [ $CGI_USE_SUDO -eq 1 -a $? -eq 0 ]; then
    CGI_SMARTHTML_CMD="${SUDOCMD} -u ${CGI_SUDO_USER} ${CGI_SMARTHTML_CMD}"
fi

############################### Main section ##################################

eval `echo "${QUERY_STRING} " | $SED_CMD -e 's/[)(;\`\\]//g' -e 's/&/\; /g'`
printf "Content-type: text/html; charset=utf-8\n\n"

case $call in
    refresh)
        $CGI_SMARTHTML_CMD norrd
    ;;
    resetwarn)
        $CGI_SMARTHTML_CMD resetwarn && $CGI_SMARTHTML_CMD norrd
    ;;
    resetcount)
        $CGI_SMARTHTML_CMD resetcount && $CGI_SMARTHTML_CMD norrd
    ;;
    *)
        echo "Error! Wrong call (${call})..."
        exit 1
    ;;
esac

exit 0;
