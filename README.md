# URL 
https://github.com/mulefish/tampermonkey_QAHelperer_find_selectors

# QUESTION?! Why is everything so weird here? The selectors are... 
Mostly because Quasar, but some because the dev team did not give unique ids to the various widgets, but mostly quasar.

# tampermonkey_QAHelperer_find_selectors
Dynamically find selectors: Why? To help build out playwright scripts

# What does this do? 
On button pressed it will look to see what selectors it sees. Currently this is looking for 'data-testid' and 'data-test-id'. 

# NOTICE in the below screenshots
1: Top right of the screen: if this script is running, there will be a button 
2: If there is a sought for thing there will be a little box floating nearby 

# telos_populate.js
Populate telos site

# tampermonkey is running and is toggled ON
![screetshot_toggled_ON](screetshot_toggled_ON.png)

# tampermonkey is running and is toggled OFF 
![screenshot_toggled_OFF](screenshot_toggled_OFF.png)

# tampermonkey is not running 
![screenshot_while_not_running.png](screenshot_while_not_running.png)

# tampermonkey is being turned on
![screenshot_turning_script_on](screenshot_turning_script_on.png)

# tampermonkey on the signup page 
![screenshot_robot_signup](screenshot_robot_signup.png)