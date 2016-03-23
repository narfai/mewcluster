#Copyright 2016 François Cadeillan

#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at

#    http://www.apache.org/licenses/LICENSE-2.0

#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.

FROM base/archlinux
MAINTAINER Francois Cadeillan <francois@azsystem.fr>

# Add cluster user
RUN groupadd -r nodecluster && useradd -r -g nodecluster nodecluster

RUN pacman -Sy --force curl openssl --noconfirm --noprogressbar && \
	pacman -S pacman --noconfirm --noprogressbar && \
	pacman-db-upgrade && \
	pacman-key --refresh-keys &&\
	pacman -Syu --noconfirm --noprogressbar

# Install packages (redis install redis-cli tool for maintenance)
RUN pacman -S nodejs redis npm python2 --noconfirm --noprogress
RUN npm config --global set python /usr/bin/python2

# Add and prepare cluster server data
RUN mkdir -p /server/{pids,logs}
ADD server /server
RUN chown -R nodecluster:nodecluster /server
ONBUILD WORKDIR /server
ONBUILD RUN npm update

# Add and prepare app dir
ADD app /app
RUN chown -R nodecluster:nodecluster /app
ONBUILD WORKDIR /app
ONBUILD RUN npm update

# Volume configuration
VOLUME /app
VOLUME /server

RUN gpg --keyserver pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && curl -o /usr/local/bin/gosu -SL "https://github.com/tianon/gosu/releases/download/1.2/gosu-amd64" \
    && curl -o /usr/local/bin/gosu.asc -SL "https://github.com/tianon/gosu/releases/download/1.2/gosu-amd64.asc" \
    && gpg --verify /usr/local/bin/gosu.asc \
    && rm /usr/local/bin/gosu.asc \
    && rm -r /root/.gnupg/ \
    && chmod +x /usr/local/bin/gosu

# Prepare entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chown nodecluster:nodecluster /entrypoint.sh
RUN chmod u+x /entrypoint.sh
ENTRYPOINT  ["/entrypoint.sh"]

# Setting working directory
WORKDIR /server

# Setting current user
#USER nodecluster

# Will listen on port 80 for http
EXPOSE 8080

# CMD always at the end of file cause we can only have one by file
CMD ["load"]
