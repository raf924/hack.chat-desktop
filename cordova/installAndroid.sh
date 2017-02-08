#!/usr/bin/env bash
wget https://dl.google.com/android/repository/tools_r25.2.3-linux.zip
sudo mkdir "$ANDROID_HOME" ;; sudo chmod a+rw "$ANDROID_HOME" && unzip tools_r25.2.3-linux.zip -d "$ANDROID_HOME"
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t platform-tools
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t tools
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t build-tools-25.0.0
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t android-23
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t extra-google-m2repository
echo y | "$ANDROID_HOME/tools/android" update sdk -u -a -t extra-android-m2repository