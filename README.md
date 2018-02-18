# Bandcamp to Mailchimp

Have you ever wished there was a way to automatically get your loyally paying
Bandcamp fans onto a Mailchimp list? Look no further!

## Setup

1. You will need to have access to port 25 for this to work successfully. How
   you go about setting that up is up to you.

2. Create a copy of `config.example.json` to `config.json`, and fill in all the
   details you require.  
   For example, if you would like a web server to run where you can view the
   logs, set `enablehttplog` to true.  
   `bandcampname` is the username you recieve in emails when you get a
   confirmation email.

3. Create a forwarding rule on your email client that redirects all Bandcamp
   emails to this STMP server, where ever it may be running.

4. ???

5. Profit.


## Warning

I am very aware this is probably unsecure, but I haven't found any other
solution online yet that allows me to get new bandcamp purchasers directly onto
my Mailchimp list.
