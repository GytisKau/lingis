import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/a11y';
import '@ionic/react/css/ionic-swiper.css';

import {
  STUDY_TIPS,
  TIP_CATEGORIES,
  TIP_CATEGORY_META,
  TipCategory,
  TipItem,
} from '../data/tipsData';
import './TipsCarousel.css';

interface TipsCarouselProps {
  title?: string;
  items?: readonly TipItem[];
  dailyCount?: number;
}

function getLocalDaySeed(date: Date = new Date()): number {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight.getTime() / (24 * 60 * 60 * 1000));
}

function groupTipsByCategory(items: readonly TipItem[]): Map<TipCategory, TipItem[]> {
  const grouped = new Map<TipCategory, TipItem[]>();

  TIP_CATEGORIES.forEach((category) => {
    grouped.set(category, []);
  });

  [...items]
    .sort((a, b) => a.id - b.id)
    .forEach((item) => {
      const current = grouped.get(item.category) ?? [];
      current.push(item);
      grouped.set(item.category, current);
    });

  return grouped;
}

function selectDailyTips(
  items: readonly TipItem[],
  daySeed: number,
  dailyCount: number
): TipItem[] {
  const grouped = groupTipsByCategory(items);

  const availableCategories = TIP_CATEGORIES.filter(
    (category) => (grouped.get(category)?.length ?? 0) > 0
  );

  if (availableCategories.length === 0) return [];

  const rotatedCategories = availableCategories.map(
    (_, index) =>
      availableCategories[(index + (daySeed % availableCategories.length)) % availableCategories.length]
  );

  const cycleLength = rotatedCategories.reduce((product, category) => {
    const groupSize = grouped.get(category)?.length ?? 1;
    return product * Math.max(groupSize, 1);
  }, 1);

  let mixedRadixCursor = ((daySeed % cycleLength) + cycleLength) % cycleLength;

  return rotatedCategories
    .slice(0, Math.min(dailyCount, rotatedCategories.length))
    .map((category, slot) => {
      const bucket = grouped.get(category) ?? [];
      const bucketLength = bucket.length;

      if (!bucketLength) return null;

      const digit = mixedRadixCursor % bucketLength;
      mixedRadixCursor = Math.floor(mixedRadixCursor / bucketLength);

      const tipIndex = (digit + slot) % bucketLength;
      return bucket[tipIndex];
    })
    .filter((tip): tip is TipItem => tip !== null);
}

const TipsCarousel: React.FC<TipsCarouselProps> = ({
  title = "Today’s study tips",
  items = STUDY_TIPS,
  dailyCount = 5,
}) => {
  const daySeed = getLocalDaySeed();

  const dailyTips = useMemo(() => {
    return selectDailyTips(items, daySeed, dailyCount);
  }, [items, daySeed, dailyCount]);

  return (
    <section className="tips-carousel-section" aria-labelledby="tips-carousel-title">
      <div className="tips-carousel__header">
        <h2 id="tips-carousel-title" className="tips-carousel__title">
          {title}
        </h2>
      </div>

      <div className="tips-carousel__swiper">
        <Swiper
          modules={[Pagination, A11y, Keyboard]}
          slidesPerView={1.08}
          spaceBetween={12}
          speed={350}
          slidesPerGroup={1}
          slideToClickedSlide={true}
          pagination={{ clickable: true, bulletElement: 'button' }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{
            enabled: true,
            containerRole: 'group',
            containerRoleDescriptionMessage: 'carousel',
            itemRoleDescriptionMessage: 'study tip',
            slideRole: 'group',
          }}
          rewind={dailyTips.length > 1}
          watchOverflow={true}
          snapToSlideEdge={true}
          grabCursor={true}
          simulateTouch={true}
          allowTouchMove={true}
          touchRatio={1}
          touchAngle={45}
          breakpoints={{
            768: {
              slidesPerView: 1.1,
              spaceBetween: 14,
              slidesPerGroup: 1,
            },
            1024: {
              slidesPerView: 1.08,
              spaceBetween: 16,
              slidesPerGroup: 1,
            },
          }}
        >
          {dailyTips.map((tip, index) => {
            const meta = TIP_CATEGORY_META[tip.category];

            return (
              <SwiperSlide key={tip.id}>
                <article className={`tips-card ${meta.themeClassName}`}>
                  <div className="tips-card__meta">
                    <span className="tips-card__category">{meta.label}</span>
                    <span className="tips-card__icon" aria-hidden="true">
                      {meta.icon}
                    </span>
                  </div>

                  <p className="tips-card__text">{tip.text}</p>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default TipsCarousel;