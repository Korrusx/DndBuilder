import { Linking, Text } from 'react-native';

import { splitLinks } from '@/shared/lib/links';

import { AppText } from '../AppText/AppText';
import { styles } from './LinkedText.styles';
import type { LinkedTextProps } from './LinkedText.types';

/** Текст, в котором адреса https://… открываются по нажатию и переносятся на узком экране. */
export function LinkedText({ text, ...rest }: LinkedTextProps) {
  return (
    <AppText {...rest}>
      {splitLinks(text).map((part, i) =>
        part.url ? (
          <Text
            key={i}
            accessibilityRole="link"
            onPress={() => Linking.openURL(part.url!).catch(() => undefined)}
            style={styles.link}
          >
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </AppText>
  );
}
