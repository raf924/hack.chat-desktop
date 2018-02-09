echo y | sdkmanager.bat platform-tools --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080
echo y | sdkmanager.bat tools --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080
echo y | sdkmanager.bat build-tools;26.0.1 --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080
echo y | sdkmanager.bat platforms;android-23 --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080
echo y | sdkmanager.bat extras;google;m2repository --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080
echo y | sdkmanager.bat extras;android;m2repository --no_https --proxy=http --proxy_host=10.7.80.40 --proxy_port=8080