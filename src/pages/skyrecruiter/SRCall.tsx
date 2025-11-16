
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {useEffect, useRef, useState} from "react";
import "./SRCall.css";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";

function SRCall() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const [apiKey, setApiKey] = useState<string|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Utiliser la variable d'environnement ou fallback sur localhost
    const tokenUrl = process.env.REACT_APP_INTERVIEW_TOKEN_URL || "http://localhost:5008";
    fetch(`${tokenUrl}/token`).then(async res => {
      if (!res.ok) {
        console.error("Failed to fetch interview token:", res.statusText);
        return;
      }
      const data = await res.json();
      setApiKey(data.token.value);
    }).catch(err => {
      console.error("Error fetching interview token:", err);
    });
  }, []);

  return (
    <>
      <LiveAPIProvider options={{apiKey: apiKey || ""}}>
        <div className="streaming-console">
          {/*<SidePanel />*/}
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={true}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </>
  );
}

export default SRCall;
