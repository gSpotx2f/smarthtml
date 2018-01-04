#!/bin/sh

########################################################################
#
# This is a part of S.M.A.R.T.Html v1.0 (c) 2018
#
# Author:   gSpot at wl500g.info
# License:  GPLv3
# Depends:      smartmontools
# Recommends:   rrdtool, sendmail, openssl, sudo
#
########################################################################

export PATH="${PATH}:/bin:/sbin:/usr/bin:/usr/sbin:/opt/bin:/opt/sbin:/opt/usr/bin:/opt/usr/sbin"
export LANG="en_US.UTF-8"
SEDCMD="sed"
SMARTHTMLCMD="/opt/usr/bin/smarthtml.sh"
SUDOUSER="admin"
USE_SUDO=0
SUDOCMD=`which sudo`
if [ $USE_SUDO -eq 1 -a $? -eq 0 ]; then
    SMARTHTMLCMD="${SUDOCMD} -u ${SUDOUSER} ${SMARTHTMLCMD}"
fi

eval `echo "${QUERY_STRING} " | $SEDCMD -e 's/[)(;\`\\]//g' -e 's/&/\; /g'`
printf "Content-type: text/html; charset=utf-8\n\n"

case $call in
    refresh)
        $SMARTHTMLCMD norrd
    ;;
    resetwarn)
        $SMARTHTMLCMD resetwarn && $SMARTHTMLCMD norrd
    ;;
    resetcount)
        $SMARTHTMLCMD resetcount && $SMARTHTMLCMD norrd
    ;;
    *)
        echo "Error! Wrong call (${call})..."
        exit 1
    ;;
esac

exit 0;
