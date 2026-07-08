import { useGiftStore, AppLocale } from '@/store/useGiftStore';

// Translation dictionaries for next-intl style i18n
const DICTIONARIES: Record<AppLocale, Record<string, Record<string, string>>> = {
  en: {
    envelope: {
      title: 'Styling Envelope',
      category: 'Envelope Theme',
      color: 'Envelope Color',
      texture: 'Paper Texture',
      sealType: 'Wax Seal Style',
      sealColor: 'Seal Stamp Color',
      ribbonColor: 'Ribbon Band Color',
      stickers: 'Add Decoration Stickers',
      clickOpen: 'Click Envelope to Open',
      opening: 'Breaking Seal...',
      unfolding: 'Unfolding letter...',
      smooth: 'Smooth Paper',
      linen: 'Premium Linen',
      parchment: 'Antique Parchment',
      kraft: 'Recycled Kraft'
    },
    letter: {
      title: 'Letter Content',
      font: 'Font Family',
      size: 'Font Size',
      color: 'Text Color',
      border: 'Border Frame Style',
      speed: 'Typing Animation Speed',
      skipAnim: 'Skip Animation',
      placeholder: 'Write your heartfelt message here...',
      sigLabel: 'Letter Signature',
      effect: 'Ambient Background Effect',
      photos: 'Photo Memories Layout',
      gifts: 'Attach Gift Add-ons',
      voice: 'Voice Message Recorder',
      music: 'Background Melody Playlists',
      slow: 'Slow',
      medium: 'Medium',
      fast: 'Fast',
      skip: 'Disable Animation'
    },
    common: {
      save: 'Save Changes',
      preview: 'Gift Preview Opening',
      close: 'Close Workspace',
      loading: 'Preparing letter unboxing...',
      success: 'Gift arrangment updated successfully!',
      selectLanguage: 'Select Language'
    }
  },
  hi: {
    envelope: {
      title: 'लिफाफा संपादन',
      category: 'लिफाफा थीम',
      color: 'लिफाफा का रंग',
      texture: 'कागज की बनावट',
      sealType: 'मोम की सील',
      sealColor: 'सील का रंग',
      ribbonColor: 'रिबन का रंग',
      stickers: 'सजावट स्टिकर जोड़ें',
      clickOpen: 'खोलने के लिए लिफाफे पर क्लिक करें',
      opening: 'सील टूट रही है...',
      unfolding: 'पत्र खुल रहा है...',
      smooth: 'चिकना कागज',
      linen: 'प्रीमियम लिनन',
      parchment: 'प्राचीन चर्मपत्र',
      kraft: 'रीसायकल क्राफ्ट'
    },
    letter: {
      title: 'पत्र की सामग्री',
      font: 'फ़ॉन्ट शैली',
      size: 'फ़ॉन्ट का आकार',
      color: 'लिखाई का रंग',
      border: 'बॉर्डर फ्रेम स्टाइल',
      speed: 'टाइपिंग एनीमेशन गति',
      skipAnim: 'एनीमेशन छोड़ें',
      placeholder: 'अपना संदेश यहाँ लिखें...',
      sigLabel: 'पत्र हस्ताक्षर',
      effect: 'पृष्ठभूमि प्रभाव',
      photos: 'फोटो यादें लेआउट',
      gifts: 'उपहार संलग्न करें',
      voice: 'आवाज संदेश रिकॉर्डर',
      music: 'पृष्ठभूमि संगीत प्लेलिस्ट',
      slow: 'धीमा',
      medium: 'मध्यम',
      fast: 'तेज़',
      skip: 'एनीमेशन अक्षम करें'
    },
    common: {
      save: 'परिवर्तन सहेजें',
      preview: 'उपहार का पूर्वावलोकन',
      close: 'बंद करें',
      loading: 'पत्र खोलने की तैयारी...',
      success: 'सफलतापूर्वक अपडेट किया गया!',
      selectLanguage: 'भाषा चुनें'
    }
  },
  mr: {
    envelope: {
      title: 'लिफाफा संपादन',
      category: 'लिफाफा थीम',
      color: 'लिफाफ्याचा रंग',
      texture: 'कागदाचा पोत',
      sealType: 'मेणाची सील',
      sealColor: 'सीलचा रंग',
      ribbonColor: 'रिबनचा रंग',
      stickers: 'सजावट स्टिकर्स जोडा',
      clickOpen: 'उघडण्यासाठी लिफाफ्यावर क्लिक करा',
      opening: 'सील तुटत आहे...',
      unfolding: 'पत्र उघडत आहे...',
      smooth: 'गुळगुळीत कागद',
      linen: 'प्रीमियम लिनन',
      parchment: 'प्राचीन कागद',
      kraft: 'क्राफ्ट कागद'
    },
    letter: {
      title: 'पत्राचा मजकूर',
      font: 'फॉन्ट शैली',
      size: 'फॉन्ट आकार',
      color: 'मजकूराचा रंग',
      border: 'बॉर्डर फ्रेम स्टाईल',
      speed: 'टायपिंग वेग',
      skipAnim: 'एनिमेशन वगळा',
      placeholder: 'तुमचा संदेश येथे लिहा...',
      sigLabel: 'पत्राची स्वाक्षरी',
      effect: 'पार्श्वभूमी प्रभाव',
      photos: 'फोटो आठवणी मांडणी',
      gifts: 'भेटवस्तू जोडा',
      voice: 'आवाज रेकॉर्डर',
      music: 'पार्श्वभूमी संगीत',
      slow: 'हळू',
      medium: 'मध्यम',
      fast: 'जलद',
      skip: 'एनिमेशन बंद करा'
    },
    common: {
      save: 'बदल जतन करा',
      preview: 'भेट पूर्वावलोकन',
      close: 'बंद करा',
      loading: 'पत्र उघडण्याची तयारी...',
      success: 'यशस्वीरित्या जतन केले!',
      selectLanguage: 'भाषा निवडा'
    }
  },
  ja: {
    envelope: {
      title: '封筒のデザイン',
      category: '封筒のテーマ',
      color: '封筒のカラー',
      texture: '用紙の質感',
      sealType: 'シーリングワックス',
      sealColor: 'ワックスの色',
      ribbonColor: 'リボンの色',
      stickers: 'デコシールを追加',
      clickOpen: '封筒をクリックして開封',
      opening: '封印を解いています...',
      unfolding: '手紙を開いています...',
      smooth: 'スムースペーパー',
      linen: '高級リネン',
      parchment: '羊皮紙風',
      kraft: 'クラフト紙'
    },
    letter: {
      title: '手紙の本文',
      font: 'フォントファミリー',
      size: 'フォントサイズ',
      color: '文字色',
      border: '飾り枠のスタイル',
      speed: 'タイピング速度',
      skipAnim: 'スキップする',
      placeholder: '心温まるメッセージをここに記入してください...',
      sigLabel: '手紙の署名',
      effect: '背景の演出効果',
      photos: '写真のレイアウト',
      gifts: 'ギフトを同封する',
      voice: '音声メッセージ録音',
      music: 'BGMプレイリスト',
      slow: '遅い',
      medium: '普通',
      fast: '速い',
      skip: 'アニメーション無効'
    },
    common: {
      save: '設定を保存',
      preview: 'ギフトを開くプレビュー',
      close: '閉じる',
      loading: '手紙を開封する準備をしています...',
      success: '設定を保存しました！',
      selectLanguage: '言語の選択'
    }
  },
  fr: {
    envelope: {
      title: 'Style de l\'enveloppe',
      category: 'Thème de l\'enveloppe',
      color: 'Couleur de l\'enveloppe',
      texture: 'Texture du papier',
      sealType: 'Sceau de cire',
      sealColor: 'Couleur du sceau',
      ribbonColor: 'Couleur du ruban',
      stickers: 'Ajouter des autocollants',
      clickOpen: 'Cliquez sur l\'enveloppe pour l\'ouvrir',
      opening: 'Rupture du sceau...',
      unfolding: 'Dépliage de la lettre...',
      smooth: 'Papier Lisse',
      linen: 'Lin Premium',
      parchment: 'Parchemin Antique',
      kraft: 'Kraft Recyclé'
    },
    letter: {
      title: 'Contenu de la lettre',
      font: 'Style de police',
      size: 'Taille de police',
      color: 'Couleur du texte',
      border: 'Style de bordure',
      speed: 'Vitesse de frappe',
      skipAnim: 'Passer l\'animation',
      placeholder: 'Écrivez votre message ici...',
      sigLabel: 'Signature de la lettre',
      effect: 'Effet ambiant de fond',
      photos: 'Souvenirs photos',
      gifts: 'Joindre des cadeaux',
      voice: 'Enregistrement vocal',
      music: 'Mélodies de fond',
      slow: 'Lent',
      medium: 'Moyen',
      fast: 'Rapide',
      skip: 'Désactiver l\'animation'
    },
    common: {
      save: 'Enregistrer',
      preview: 'Aperçu de l\'ouverture',
      close: 'Fermer',
      loading: 'Préparation du déballage...',
      success: 'Cadeau mis à jour avec succès !',
      selectLanguage: 'Choisir la langue'
    }
  },
  de: {
    envelope: {
      title: 'Umschlaggestaltung',
      category: 'Umschlagthema',
      color: 'Umschlagfarbe',
      texture: 'Papiertextur',
      sealType: 'Wachssiegel-Stil',
      sealColor: 'Siegelfarbe',
      ribbonColor: 'Schleifenfarbe',
      stickers: 'Aufkleber hinzufügen',
      clickOpen: 'Klicken zum Öffnen',
      opening: 'Siegel bricht...',
      unfolding: 'Brief entfaltet sich...',
      smooth: 'Glattes Papier',
      linen: 'Premium Leinen',
      parchment: 'Antikes Pergament',
      kraft: 'Recyceltes Kraftpapier'
    },
    letter: {
      title: 'Briefinhalt',
      font: 'Schriftart',
      size: 'Schriftgröße',
      color: 'Textfarbe',
      border: 'Rahmenstil',
      speed: 'Tippgeschwindigkeit',
      skipAnim: 'Animation überspringen',
      placeholder: 'Schreiben Sie Ihre Nachricht hier...',
      sigLabel: 'Briefunterschrift',
      effect: 'Hintergrundeffekt',
      photos: 'Fotogalerie Layout',
      gifts: 'Geschenk anhängen',
      voice: 'Sprachnachricht aufnehmen',
      music: 'Hintergrundmusik',
      slow: 'Langsam',
      medium: 'Mittel',
      fast: 'Schnell',
      skip: 'Animation deaktivieren'
    },
    common: {
      save: 'Änderungen speichern',
      preview: 'Vorschau öffnen',
      close: 'Schließen',
      loading: 'Brieföffnung wird vorbereitet...',
      success: 'Erfolgreich aktualisiert!',
      selectLanguage: 'Sprache wählen'
    }
  },
  es: {
    envelope: {
      title: 'Estilo de Sobre',
      category: 'Tema de Sobre',
      color: 'Color de Sobre',
      texture: 'Textura del papel',
      sealType: 'Sello de cera',
      sealColor: 'Color del sello',
      ribbonColor: 'Color de la cinta',
      stickers: 'Añadir pegatinas',
      clickOpen: 'Haz clic para abrir el sobre',
      opening: 'Rompiendo sello...',
      unfolding: 'Desplegando carta...',
      smooth: 'Papel liso',
      linen: 'Lino premium',
      parchment: 'Pergamino antiguo',
      kraft: 'Kraft reciclado'
    },
    letter: {
      title: 'Contenido de la carta',
      font: 'Tipo de letra',
      size: 'Tamaño de letra',
      color: 'Color del texto',
      border: 'Estilo de marco',
      speed: 'Velocidad de escritura',
      skipAnim: 'Omitir animación',
      placeholder: 'Escribe tu mensaje aquí...',
      sigLabel: 'Firma de la carta',
      effect: 'Efecto ambiental',
      photos: 'Galería de fotos',
      gifts: 'Adjuntar regalos',
      voice: 'Grabar mensaje de voz',
      music: 'Melodía de fondo',
      slow: 'Lento',
      medium: 'Medio',
      fast: 'Rápido',
      skip: 'Desactivar animación'
    },
    common: {
      save: 'Guardar cambios',
      preview: 'Vista previa de apertura',
      close: 'Cerrar',
      loading: 'Preparando desempaque...',
      success: '¡Regalo actualizado con éxito!',
      selectLanguage: 'Seleccionar idioma'
    }
  }
};

export function useTranslations(namespace: 'envelope' | 'letter' | 'common') {
  const locale = useGiftStore((s) => s.locale);

  return {
    t: (key: string): string => {
      const dic = DICTIONARIES[locale] || DICTIONARIES.en;
      const section = dic[namespace] || {};
      return section[key] || key;
    }
  };
}
