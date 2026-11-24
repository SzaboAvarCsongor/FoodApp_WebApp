import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export default function usePolling(callback, intervalMs = 10000, enabled = true){
    const savedCallback = useRef(callback);
    const inFlight = useRef(false);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if(!enabled) return undefined;

        let timer = null;

        const tick = async() => {
            if(inFlight.current) return;
            inFlight.current = true;
            try{
                await savedCallback.current();
            } catch(e){
                console.log('Frissítési hiba:', e);
            } finally{
                inFlight.current = false;
            }
        };

        const start = () => {
            if (!timer) timer = setInterval(tick, intervalMs);
        };

        const stop = () => {
            if(timer){
                clearInterval(timer);
                timer = null;
            }
        };

        start();

        const sub = AppState.addEventListener('change', (state) => {
            if(state === 'active'){
                tick();
                start();
            } else{
                stop();
            }
        });

        return () => {
            stop();
            sub.remove();
        };
    }, [intervalMs, enabled]);
}