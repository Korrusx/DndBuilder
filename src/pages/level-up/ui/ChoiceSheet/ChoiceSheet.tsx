import { Text, View } from 'react-native';

import { computeSheet } from '@/entities/character';
import {
  choicePreview,
  choiceTitle,
  levelChoices,
  levelSnapshot,
  lowerFirst,
  RowList,
  rowLabel,
  rowValue,
  withoutChoice,
} from '@/features/level-up';
import { content } from '@/shared/content';
import { t } from '@/shared/i18n';
import { BottomSheet, Button } from '@/shared/ui';

import { styles } from './ChoiceSheet.styles';
import type { ChoiceSheetProps } from './ChoiceSheet.types';
import { ClassOptionsEditor } from './editors/ClassOptionsEditor';
import type { EditorProps } from './editors/editors.types';
import { FeatEditor } from './editors/FeatEditor';
import { LanguagesEditor } from './editors/LanguagesEditor';
import { ListEditor } from './editors/ListEditor';
import { SkillsEditor } from './editors/SkillsEditor';
import { SubclassEditor } from './editors/SubclassEditor';

const SKILL_KINDS = new Set(['expertise', 'skills', 'multiclassProficiency']);

function Editor(props: EditorProps) {
  switch (props.choice.kind) {
    case 'subclass':
      return <SubclassEditor {...props} />;
    case 'feat':
      return <FeatEditor {...props} />;
    case 'expertise':
    case 'skills':
    case 'multiclassProficiency':
      return <SkillsEditor {...props} />;
    case 'featureLanguages':
    case 'languages':
      return <LanguagesEditor {...props} />;
    case 'classOption':
      return <ClassOptionsEditor {...props} />;
    case 'replaceOption':
      return props.choice.optionKind ? <ClassOptionsEditor {...props} /> : <ListEditor {...props} />;
    default:
      return <ListEditor {...props} />;
  }
}

/**
 * Шторка выбора (У4): существующий экран выбора, счётчик «2 из 2» и предпросмотр «было → станет»:
 * до трёх ключевых чисел и одна строка побочного эффекта.
 */
export function ChoiceSheet({ choice, prev, next, set, onClose }: ChoiceSheetProps) {
  // Выбор берём заново из черновика: счётчик обновляется после каждого нажатия.
  const live = choice ? (levelChoices(next, prev, content).find((c) => c.id === choice.id) ?? choice) : null;
  const preview = live
    ? choicePreview(
        levelSnapshot(withoutChoice(next, prev, live, content), content),
        levelSnapshot(next, content),
        content,
      )
    : null;
  const context = { attacks: computeSheet(next, content).attacks };
  const skills = live ? SKILL_KINDS.has(live.kind) : false;

  return (
    <BottomSheet visible={!!live} onClose={onClose}>
      {live ? (
        <>
          <View style={styles.head}>
            <Text style={styles.title}>{choiceTitle(live)}</Text>
            {live.count > 0 ? (
              <Text style={styles.counter}>{t('levelUpDeck.picked', { picked: live.picked, count: live.count })}</Text>
            ) : null}
          </View>
          {live.problems.length && live.picked > 0 ? <Text style={styles.hint}>{live.problems[0]}</Text> : null}
          <Editor choice={live} prev={prev} next={next} set={set} />
          {preview && !skills && preview.rows.length ? <RowList rows={preview.rows} context={context} boxed /> : null}
          {preview?.sideEffect ? (
            <View style={styles.side}>
              <Text style={styles.sideText}>
                {t('levelUpDeck.sideEffect', { what: lowerFirst(rowLabel(preview.sideEffect.label, context)) })}{' '}
                <Text style={styles.sideNumbers}>
                  {rowValue(preview.sideEffect.label, preview.sideEffect.before ?? 0)} →{' '}
                  {rowValue(preview.sideEffect.label, preview.sideEffect.after)}
                </Text>
              </Text>
            </View>
          ) : null}
          <Button title={t('common.done')} onPress={onClose} />
        </>
      ) : null}
    </BottomSheet>
  );
}
