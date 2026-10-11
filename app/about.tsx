import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';

export default function AboutScreen() {
  return (
    <Screen>
      <AppText variant="heading">Атрибуция</AppText>
      <AppText>
        Это приложение использует материалы System Reference Document 5.2 («SRD 5.2») от Wizards of
        the Coast LLC, доступные по адресу https://www.dndbeyond.com/srd. SRD 5.2 распространяется
        по лицензии Creative Commons Attribution 4.0 International (CC BY 4.0):
        https://creativecommons.org/licenses/by/4.0/legalcode.
      </AppText>
      <AppText variant="secondary">
        Тексты SRD приведены в собственном переводе и могут быть изменены по сравнению с оригиналом.
        Приложение не является официальным продуктом Wizards of the Coast.
      </AppText>
    </Screen>
  );
}
