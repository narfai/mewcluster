FROM azsystem/archlinux:latest
MAINTAINER Francois Cadeillan <francois@azsystem.fr>

# Add cluster user
RUN groupadd -r nodecluster && useradd -r -g nodecluster nodecluster

# Install packages (redis install redis-cli tool for maintenance)
RUN pacman -S nodejs redis npm --noconfirm --noprogress

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

# Prepare entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chown nodecluster:nodecluster /entrypoint.sh
RUN chmod u+x /entrypoint.sh
ENTRYPOINT  ["/entrypoint.sh"]

# Setting working directory
WORKDIR /server

# Will listen on port 80 for http
EXPOSE 80

# CMD always at the end of file cause we can only have one by file
CMD ["load"]
