import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';
import { WebView } from 'react-native-webview';

import { DICE_LANDED_TIMEOUT } from '../../config/diceSettings';
import { DICE_SCENE_HTML } from '../../config/diceScene.generated';
import { styles } from './DiceTable.styles';
import type { DiceTableProps } from './DiceTable.types';

const SOURCE = { html: DICE_SCENE_HTML };

/**
 * 3D-стол с костями к4–к20 (three.js + cannon-es в WebView). Числа решает приложение, сцена только подбирает полёт
 * так, чтобы кубики легли нужной гранью вверх, и сообщает «остановились».
 */
export function DiceTable({ roll, settings, onLanded, onError }: DiceTableProps) {
  // В типах react-native-webview 14 параметр по умолчанию `undefined` превращает пропсы в never
  const web = useRef<WebView<object>>(null);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { skin, table, animation, sound } = settings;

  const run = (js: string) => web.current?.injectJavaScript(`${js};true;`);

  useEffect(() => {
    if (ready) {
      run(`window.diceSetup(${JSON.stringify({ skin, table, sound })})`);
    }
  }, [ready, skin, table, sound]);

  useEffect(() => {
    if (!ready || !roll) {
      return;
    }
    run(
      `window.diceRoll(${JSON.stringify({ id: roll.id, values: roll.dice, sides: roll.sides, keep: roll.keep, animate: animation })})`,
    );
    // Страховка: если сцена зависла, итог всё равно появится.
    timer.current = setTimeout(() => onLanded(roll.id), DICE_LANDED_TIMEOUT);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, roll?.id]);

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: { type?: string; id?: number; message?: string };
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'ready') {
      setReady(true);
    } else if (msg.type === 'landed' && typeof msg.id === 'number') {
      if (msg.id === roll?.id) {
        clearTimeout(timer.current);
      }
      onLanded(msg.id);
    } else if (msg.type === 'error') {
      console.warn('[dice] scene error:', msg.message);
      onError();
    }
  };

  return (
    <View style={styles.table}>
      <WebView<object>
        ref={web}
        source={SOURCE}
        originWhitelist={['*']}
        // Стук костей (Web Audio в сцене) звучит без нажатия на сам стол
        mediaPlaybackRequiresUserAction={false}
        onMessage={onMessage}
        onError={(e) => {
          console.warn('[dice] webview error:', JSON.stringify(e.nativeEvent));
          onError();
        }}
        onRenderProcessGone={(e) => {
          console.warn('[dice] render process gone:', JSON.stringify(e.nativeEvent));
          onError();
        }}
        onContentProcessDidTerminate={() => {
          console.warn('[dice] content process terminated');
          onError();
        }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        androidLayerType="hardware"
        style={styles.web}
      />
    </View>
  );
}
