# Nestauth
This is an authentication system that I have built for my personal server. Its sole purpose is to protect subdomains by authenticating requests to a NGINX reverse proxy. It is mostly meant for securing applications that you want only a few people to have access to. Feel free to contact me if you encounter any issues and prs are always welcome :D

**NOTE:** This only works in cases where you have one base domain (ex. *example.com*) and you want to secure a subdomain (ex. *test.example.com*)

# Installing
1. Clone the git repository
2. Install dependencies for backend and frontend using `npm i`
3. Change the values in frontend/src/config.ts
4. Build the project using `npm run build`
5. Setup the environment variables by some means. `.env.example` contains an example of environment variables
6. Start the application by running `node build/index.js`. I would recommend setting it up as some sort of daemon, for example a service on linux works fine

# NGINX Configuration
Here is an example of what you would include into your NGINX reverse proxy configuration (I would recommend setting this up in a include folder and then include it). This setup assumes you are running nestauth on port 3000 and you need to replace `PUBLICURL` with whatever the public url of your instance of nestauth would be
```
location /nginxauth {
    internal;
    proxy_pass http://127.0.0.1:3000/nginxauth;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";

    proxy_set_header Host $host;
    proxy_set_header X-Original-Host $host;
    proxy_set_header X-Original-Remote-Addr $remote_addr;
    proxy_set_header X-Original-URI $request_uri;
}

location @login {
    return 302 https://PUBLICURL/login?url=$scheme://$http_host$request_uri;
}

error_page 401 @login;
```
Then in order to actually make your reverse proxy use authentication you would include the following in the root location.
```
auth_request /nginxauth;
auth_request_set $auth_status $upstream_status;
```
