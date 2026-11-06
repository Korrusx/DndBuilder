import { useEffect, useRef, useState } from 'react';
import type { HostInstance } from 'react-native';
import { Text, View } from 'react-native';

import { BRAND_MARK } from '@/shared/config';
import { t } from '@/shared/i18n';

import { DONE_SCREEN, HERO_CARD_THEMES } from '../../config/heroCardThemes';
import { POST_MARGIN, SHARE_SCENES, STATIC_SPARKS, STORY } from '../../config/shareScenes';
import { HeroCardView } from '../HeroCardView/HeroCardView';
import { StyleBackdrop } from '../StyleBackdrop/StyleBackdrop';
import { BrandIcon } from './BrandIcon';
import { styles } from './ShareScene.styles';
import type { ShareSceneProps } from './ShareScene.types';

const FULL_CARD = 350;
/** Skia рисует холсты после раскладки — снимок делается чуть позже. */
const DRAW_DELAY = 250;

/**
 * Сцена картинки «Поделиться» (раздел 9): пост 4:5 — полная карта по центру; сторис 9:16 — шапка,
 * компактная карта, водяной знак уровня и знак бренда. Без анимаций: блика нет, искры стоят на местах.
 */
export function ShareScene({ kind, style, card, storyTitle, campaignLine, onReady }: ShareSceneProps) {
  const scene = SHARE_SCENES[kind];
  const theme = HERO_CARD_THEMES[style];
  const ref = useRef<HostInstance>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const story = kind === 'story';
  const fit = story || !cardHeight ? 1 : Math.min(1, (scene.height - POST_MARGIN * 2) / cardHeight);
  const ySpark = scene.height / SHARE_SCENES.story.height;

  useEffect(() => {
    if (!cardHeight) {
      return;
    }
    const timer = setTimeout(() => onReady(ref), DRAW_DELAY);
    return () => clearTimeout(timer);
  }, [cardHeight, onReady]);

  const heroCard = (
    <View onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)} style={{ transform: [{ scale: fit }] }}>
      <HeroCardView
        {...card}
        theme={theme}
        size={story ? 'compact' : 'full'}
        width={story ? STORY.cardWidth : FULL_CARD}
      />
    </View>
  );

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.scene,
        { width: scene.width, height: scene.height, backgroundColor: theme.screenBg[theme.screenBg.length - 1][1] },
      ]}
    >
      <StyleBackdrop
        style={style}
        animate={false}
        centerY={scene.centerY}
        positions={[...scene.positions] as [number, number, number]}
      />
      {story ? (
        <Text style={[styles.watermark, { color: theme.watermark, opacity: STORY.watermarkOpacity }]}>
          {card.level}
        </Text>
      ) : null}
      {STATIC_SPARKS.map((spark) => (
        <View
          key={`${spark.x}-${spark.y}`}
          style={[
            styles.spark,
            {
              left: spark.x,
              top: spark.y * ySpark,
              width: spark.size,
              height: spark.size,
              opacity: spark.opacity,
              backgroundColor: theme.spark[0],
              boxShadow: `0 0 10px ${theme.spark[0]}`,
            },
          ]}
        />
      ))}
      {story ? (
        <View style={styles.story}>
          <View style={styles.head}>
            <Text style={[styles.kicker, { color: theme.accentLabel }]}>
              {t('heroCard.newLevel').toLocaleUpperCase()}
            </Text>
            <Text numberOfLines={2} style={[styles.title, { color: DONE_SCREEN.title }]}>
              {storyTitle}
            </Text>
          </View>
          {heroCard}
          <View style={styles.spacer} />
          <View style={styles.foot}>
            {campaignLine ? <Text style={[styles.campaign, { color: theme.foot }]}>{campaignLine}</Text> : null}
            <View style={styles.brandRow}>
              <BrandIcon theme={theme} size={18} />
              <Text style={[styles.brand, { color: DONE_SCREEN.title }]}>
                <Text style={{ color: theme.corner }}>{BRAND_MARK.first}</Text>
                {BRAND_MARK.second}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.post}>{heroCard}</View>
      )}
    </View>
  );
}
