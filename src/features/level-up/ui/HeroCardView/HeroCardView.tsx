import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Image, Text, View } from 'react-native';

import { BRAND_MARK } from '@/shared/config';
import { t } from '@/shared/i18n';

import { CardFrame } from './decor/CardFrame';
import { CardInnerDecor } from './decor/CardInnerDecor';
import { D20Divider } from './decor/D20Divider';
import { PortraitRing } from './decor/PortraitRing';
import { CARD_SIZES, styles } from './HeroCardView.styles';
import type { HeroCardViewProps } from './HeroCardView.types';

type Size = { width: number; height: number };
const sizeOf = (e: LayoutChangeEvent): Size => ({
  width: e.nativeEvent.layout.width,
  height: e.nativeEvent.layout.height,
});
const INNER_PADDING = 18;

/**
 * Карта героя: только показывает переданные данные в переданной теме.
 * Декоративные слои — Skia (рамка-фольга, фон, кольцо, разделитель, блик), текст и медальоны — поверх.
 * Для диктора карта — одна подпись, декоративные слои скрыты.
 */
export function HeroCardView(props: HeroCardViewProps) {
  const { theme, size, width, stats, motion } = props;
  const dims = CARD_SIZES[size];
  const full = size === 'full';
  const [frame, setFrame] = useState<Size | null>(null);
  const [inner, setInner] = useState<Size | null>(null);
  const nameSize = dims.nameSize ?? theme.nameSize;
  const face = dims.portrait - dims.ring * 2;
  const shadow = [`0 24px 60px ${theme.shadow}`, theme.glow ? `0 0 60px ${theme.glow}` : ''].filter(Boolean).join(', ');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={props.accessibilityLabel}
      onLayout={(e) => setFrame(sizeOf(e))}
      style={[styles.frame, { width, boxShadow: shadow }]}
    >
      {frame ? <CardFrame theme={theme} angle={motion?.frameAngle} {...frame} /> : null}
      <View style={styles.inner} onLayout={(e) => setInner(sizeOf(e))}>
        {inner ? <CardInnerDecor layer="back" theme={theme} {...inner} /> : null}

        {full ? (
          <Text
            style={[
              styles.watermark,
              {
                color: theme.watermark,
                fontSize: props.level > 9 ? 160 : 200,
                lineHeight: props.level > 9 ? 160 : 200,
              },
            ]}
          >
            {props.level}
          </Text>
        ) : null}

        <View style={[styles.portrait, { width: dims.portrait, height: dims.portrait }]}>
          <PortraitRing theme={theme} size={dims.portrait} ring={dims.ring} />
          <View
            style={[
              styles.face,
              { top: dims.ring, left: dims.ring, width: face, height: face, borderRadius: face / 2 },
            ]}
          >
            {props.portrait ? (
              <Image
                source={{ uri: props.portrait }}
                style={[styles.photo, { width: face, height: face, borderRadius: face / 2 }]}
              />
            ) : (
              <Text
                style={[styles.letter, { fontFamily: theme.nameFont, fontSize: full ? 48 : 38, color: theme.faceText }]}
              >
                {props.letter}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.badge,
              {
                width: dims.badge,
                height: dims.badge,
                borderRadius: dims.badge / 2,
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
              },
            ]}
          >
            <Text style={{ fontFamily: theme.numFont, fontSize: dims.badgeText, color: theme.badgeText }}>
              {props.level}
            </Text>
          </View>
        </View>

        <View style={styles.who}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={dims.nameMin / nameSize}
            style={[styles.name, { fontFamily: theme.nameFont, fontSize: nameSize, color: theme.text }]}
          >
            {props.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.sub, { fontFamily: theme.bodyFont, fontSize: dims.subSize, color: theme.sub }]}
          >
            {props.subtitle}
          </Text>
        </View>

        {inner && full ? <D20Divider theme={theme} width={inner.width - INNER_PADDING * 2} /> : null}

        <View style={[styles.stats, { gap: dims.statGap }]}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.stat,
                {
                  borderRadius: dims.statRadius,
                  paddingVertical: dims.statPadV,
                  paddingHorizontal: dims.statPadH,
                  backgroundColor: theme.statBg,
                  borderColor: theme.statBorder,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.statLabel,
                  { fontSize: dims.statLabel, letterSpacing: dims.statLabel * 0.08, color: theme.accentLabel },
                ]}
              >
                {stat.label}
              </Text>
              <Text style={{ fontFamily: theme.numFontStat, fontSize: dims.statValue, color: theme.text }}>
                {stat.value}
              </Text>
              <Text
                style={[styles.statChange, { fontSize: dims.statChange, color: stat.change ? theme.good : theme.none }]}
              >
                {stat.change ?? '—'}
              </Text>
            </View>
          ))}
        </View>

        {props.unlocked ? (
          <View
            style={[
              styles.unlocked,
              !full && styles.unlockedCompact,
              { backgroundColor: theme.newBg, borderColor: theme.newBorder },
            ]}
          >
            {full ? (
              <Text style={[styles.unlockedLabel, { fontFamily: theme.bodyFont, color: theme.accentLabel }]}>
                {t('heroCard.unlocked').toLocaleUpperCase()}
              </Text>
            ) : null}
            <Text
              numberOfLines={dims.unlockedLines}
              style={[
                styles.unlockedText,
                { fontFamily: theme.bodyFont, fontSize: dims.unlockedSize, color: theme.text },
              ]}
            >
              {props.unlocked}
            </Text>
            {full && props.next ? (
              <Text numberOfLines={1} style={[styles.nextText, { fontFamily: theme.bodyFont, color: theme.nextText }]}>
                {props.next}
              </Text>
            ) : null}
          </View>
        ) : null}

        {full && props.footer !== undefined ? (
          <View style={styles.foot}>
            <Text numberOfLines={1} style={[styles.footText, { fontFamily: theme.bodyFont, color: theme.foot }]}>
              {props.footer}
            </Text>
            <Text style={[styles.brand, { color: theme.foot }]}>
              <Text style={{ color: theme.corner }}>{BRAND_MARK.first}</Text>
              {BRAND_MARK.second}
            </Text>
          </View>
        ) : null}

        {inner && motion?.sheenProgress ? (
          <CardInnerDecor
            layer="sheen"
            theme={theme}
            sheenProgress={motion.sheenProgress}
            sheenOpacity={motion.sheenOpacity}
            {...inner}
          />
        ) : null}
      </View>
    </View>
  );
}
