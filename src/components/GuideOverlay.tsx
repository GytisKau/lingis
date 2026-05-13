import React, { useEffect, useMemo, useRef, useState } from "react";
import { IonButton } from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import "./GuideOverlay.css";

type GuideStep = {
  route?: string;
  targetId?: string;
  secondTargetId?: string;
  title: string;
  text: string;
  fallbackText?: string;
  noPointer?: boolean;
};

type Point = {
  x: number;
  y: number;
};

type ArrowLine = {
  start: Point;
  end: Point;
};

const GUIDE_COMPLETED_KEY = "lingisGuideCompleted";
const GUIDE_ACTIVE_EVENT = "startLingisGuide";

const guideSteps: GuideStep[] = [
  {
    route: "/tabs/tab3",
    title: "Welcome to Lingis!",
    text: "Want a quick tour? You can skip it and reopen it later from Profile.",
    noPointer: true,
  },
  {
    route: "/tabs/tab3",
    targetId: "home-tips",
    secondTargetId: "home-tips-read-more",
    title: "Daily study tips",
    text: "Use the bubbles or next bar to switch tips. Press Read more to see the full explanation.",
    fallbackText: "Study tips are shown on the Home page.",
  },
  {
    route: "/tabs/tab3",
    targetId: "start-session-button",
    title: "Start session",
    text: "Start or continue your study session here.",
    fallbackText: "Use Home to start or continue study sessions.",
  },

  {
    route: "/tabs/tab4",
    title: "Plan page",
    text: "This is where you add assignments, tasks, and topics.",
    noPointer: true,
  },
  {
    route: "/tabs/tab4",
    targetId: "add-assignment-button",
    title: "Add assignment",
    text: "Press this to create an exam, lab, project, or other deadline.",
    fallbackText: "Use the plus button in Plan to create assignments.",
  },
  {
    route: "/tabs/tab4",
    targetId: "task-topic-help-button",
    title: "Tasks and topics",
    text: "Tasks are single items. Topics create Passive, Active, and Testing subtasks.",
    fallbackText:
      "Tasks are single items. Topics create Passive, Active, and Testing subtasks.",
  },
  {
    route: "/tabs/tab4",
    targetId: "assignment-card-example",
    title: "Swipe actions",
    text: "Swipe assignment cards left to complete, delete, or restore them.",
    fallbackText:
      "After adding assignments, swipe cards left for complete, delete, or restore actions.",
  },
  {
    route: "/tabs/tab4",
    targetId: "overdue-button",
    title: "Overdue assignments",
    text: "Overdue assignments appear here. You can bring them back by swiping.",
    fallbackText:
      "When assignments become overdue, Lingis shows a button to view them.",
  },

  {
    route: "/tabs/tab1",
    title: "Calendar page",
    text: "Calendar shows your deadlines, available free time, and planned study sessions.",
    noPointer: true,
  },
  {
    route: "/tabs/tab1",
    title: "Edit free time",
    text: "To add free time, first press the edit button in the calendar.",
    noPointer: true,
  },
  {
    route: "/tabs/tab1",
    title: "Select free time",
    text: "Choose +, then hold and drag on the calendar to mark when you are available.",
    noPointer: true,
  },
  {
    route: "/tabs/tab1",
    title: "Remove or add manually",
    text: "Choose - to remove selected free time. Use the manual add button if you want to enter the time yourself.",
    noPointer: true,
  },
  {
    route: "/tabs/tab1",
    title: "Planned sessions",
    text: "After assignments and free time are added, Lingis places study sessions in the calendar automatically.",
    noPointer: true,
  },

  {
    route: "/tabs/tab2",
    title: "Statistics page",
    text: "Statistics shows progress, upcoming work, history, and undo options.",
    noPointer: true,
  },

  {
    route: "/tabs/tab5",
    title: "Profile page",
    text: "Profile stores preferences, modules, assignment types, notifications, and this guide.",
    noPointer: true,
  },
  {
    route: "/tabs/tab5",
    targetId: "profile-modules-types-section",
    title: "Modules and types",
    text: "Manage modules lets you add subjects or courses. Assignment type names lets you rename types like Exam, Lab, or Other for faster assignment creation.",
    fallbackText:
      "In Profile, you can manage modules and rename assignment types.",
  },
  {
    route: "/tabs/tab5",
    targetId: "profile-guide-section",
    title: "Help and guide",
    text: "You can open this guide again here anytime.",
    fallbackText: "You can reopen this guide from Profile anytime.",
  },
];

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getCloudAnchorPoint = (cloudRect: DOMRect, targetRect: DOMRect): Point => {
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const cloudPadding = 18;

  if (targetCenterY > cloudRect.bottom) {
    return {
      x: clamp(
        targetCenterX,
        cloudRect.left + cloudPadding,
        cloudRect.right - cloudPadding
      ),
      y: cloudRect.bottom,
    };
  }

  if (targetCenterY < cloudRect.top) {
    return {
      x: clamp(
        targetCenterX,
        cloudRect.left + cloudPadding,
        cloudRect.right - cloudPadding
      ),
      y: cloudRect.top,
    };
  }

  if (targetCenterX < cloudRect.left) {
    return {
      x: cloudRect.left,
      y: clamp(
        targetCenterY,
        cloudRect.top + cloudPadding,
        cloudRect.bottom - cloudPadding
      ),
    };
  }

  return {
    x: cloudRect.right,
    y: clamp(
      targetCenterY,
      cloudRect.top + cloudPadding,
      cloudRect.bottom - cloudPadding
    ),
  };
};

const getTargetEdgePoint = (targetRect: DOMRect, source: Point): Point => {
  return {
    x: clamp(source.x, targetRect.left, targetRect.right),
    y: clamp(source.y, targetRect.top, targetRect.bottom),
  };
};

const isElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
};

const GuideOverlay: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const cloudRef = useRef<HTMLDivElement | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [secondTargetRect, setSecondTargetRect] = useState<DOMRect | null>(
    null
  );
  const [cloudRect, setCloudRect] = useState<DOMRect | null>(null);
  const [isPreparingStep, setIsPreparingStep] = useState(false);

  const currentStep = guideSteps[stepIndex];

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === guideSteps.length - 1;

  const routeMismatch =
    isActive &&
    Boolean(currentStep?.route) &&
    location.pathname !== currentStep.route;

  const hasTarget =
    Boolean(targetRect) &&
    Boolean(targetElementRef.current) &&
    !currentStep.noPointer &&
    !routeMismatch &&
    !isPreparingStep;

  const popupText = useMemo(() => {
    if (hasTarget || !currentStep.fallbackText) {
      return currentStep.text;
    }

    return currentStep.fallbackText;
  }, [currentStep, hasTarget]);

  const arrowLines: ArrowLine[] = useMemo(() => {
    if (isPreparingStep || !hasTarget || !targetRect || !cloudRect) {
      return [];
    }

    const lines: ArrowLine[] = [];

    const firstStart = getCloudAnchorPoint(cloudRect, targetRect);
    const firstEnd = getTargetEdgePoint(targetRect, firstStart);

    lines.push({
      start: firstStart,
      end: firstEnd,
    });

    if (secondTargetRect) {
      const secondStart = getCloudAnchorPoint(cloudRect, secondTargetRect);
      const secondEnd = getTargetEdgePoint(secondTargetRect, secondStart);

      lines.push({
        start: secondStart,
        end: secondEnd,
      });
    }

    return lines;
  }, [isPreparingStep, hasTarget, targetRect, secondTargetRect, cloudRect]);

  const resetPositioning = () => {
    setTargetRect(null);
    setSecondTargetRect(null);
    setCloudRect(null);
    targetElementRef.current = null;
  };

  const startGuide = () => {
    resetPositioning();
    setStepIndex(0);
    setIsPreparingStep(true);
    setIsActive(true);
  };

  const closeGuide = () => {
    localStorage.setItem(GUIDE_COMPLETED_KEY, "true");
    setIsActive(false);
    setStepIndex(0);
    resetPositioning();
    setIsPreparingStep(false);
  };

  const goToStep = (nextIndex: number) => {
    resetPositioning();
    setIsPreparingStep(true);
    setStepIndex(nextIndex);
  };

  useEffect(() => {
    const hasCompletedGuide = localStorage.getItem(GUIDE_COMPLETED_KEY);

    if (!hasCompletedGuide) {
      setIsActive(true);
      setIsPreparingStep(true);
      setStepIndex(0);
    }

    const handleStartGuide = () => {
      startGuide();
    };

    window.addEventListener(GUIDE_ACTIVE_EVENT, handleStartGuide);

    return () => {
      window.removeEventListener(GUIDE_ACTIVE_EVENT, handleStartGuide);
    };
  }, []);

  useEffect(() => {
    if (!isActive || !currentStep?.route) {
      return;
    }

    if (location.pathname !== currentStep.route) {
      resetPositioning();
      setIsPreparingStep(true);
      history.replace(currentStep.route);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsPreparingStep(false);
    }, currentStep.noPointer ? 120 : 220);

    return () => window.clearTimeout(timeoutId);
  }, [
    isActive,
    stepIndex,
    currentStep?.route,
    currentStep?.noPointer,
    location.pathname,
    history,
  ]);

  useEffect(() => {
    if (!isActive || routeMismatch || currentStep.noPointer) {
      setTargetRect(null);
      setSecondTargetRect(null);
      targetElementRef.current = null;
      return;
    }

    if (!currentStep.targetId) {
      setTargetRect(null);
      setSecondTargetRect(null);
      targetElementRef.current = null;
      return;
    }

    let timeoutId: number | undefined;
    let attempts = 0;

    const updateTargetRectsFromSameElements = () => {
      const element = targetElementRef.current;

      if (!element || !isElementVisible(element)) {
        setTargetRect(null);
        setSecondTargetRect(null);
        return;
      }

      setTargetRect(element.getBoundingClientRect());

      if (currentStep.secondTargetId) {
        const secondElement = document.getElementById(
          currentStep.secondTargetId
        );

        if (secondElement && isElementVisible(secondElement)) {
          setSecondTargetRect(secondElement.getBoundingClientRect());
        } else {
          setSecondTargetRect(null);
        }
      } else {
        setSecondTargetRect(null);
      }
    };

    const findTarget = () => {
      const element = document.getElementById(currentStep.targetId || "");

      if (!element || !isElementVisible(element)) {
        attempts += 1;

        if (attempts < 12) {
          timeoutId = window.setTimeout(findTarget, 180);
        } else {
          setTargetRect(null);
          setSecondTargetRect(null);
          targetElementRef.current = null;
          setIsPreparingStep(false);
        }

        return;
      }

      targetElementRef.current = element;

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      timeoutId = window.setTimeout(() => {
        updateTargetRectsFromSameElements();

        window.requestAnimationFrame(() => {
          if (cloudRef.current) {
            setCloudRect(cloudRef.current.getBoundingClientRect());
          }

          window.requestAnimationFrame(() => {
            setIsPreparingStep(false);
          });
        });
      }, 320);
    };

    setIsPreparingStep(true);
    timeoutId = window.setTimeout(findTarget, 260);

    window.addEventListener("resize", updateTargetRectsFromSameElements);
    window.addEventListener("scroll", updateTargetRectsFromSameElements, true);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener("resize", updateTargetRectsFromSameElements);
      window.removeEventListener(
        "scroll",
        updateTargetRectsFromSameElements,
        true
      );
    };
  }, [
    isActive,
    routeMismatch,
    stepIndex,
    currentStep?.targetId,
    currentStep?.secondTargetId,
    currentStep?.noPointer,
  ]);

  useEffect(() => {
    if (!isActive) {
      setCloudRect(null);
      return;
    }

    const updateCloudRect = () => {
      if (!cloudRef.current) {
        setCloudRect(null);
        return;
      }

      setCloudRect(cloudRef.current.getBoundingClientRect());
    };

    const frameId = window.requestAnimationFrame(updateCloudRect);

    window.addEventListener("resize", updateCloudRect);
    window.addEventListener("scroll", updateCloudRect, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateCloudRect);
      window.removeEventListener("scroll", updateCloudRect, true);
    };
  }, [isActive, stepIndex, popupText, hasTarget, targetRect, secondTargetRect]);

  if (!isActive || isPreparingStep || routeMismatch) {
    return null;
  }

  const getCloudStyle = (): React.CSSProperties => {
    const width = Math.min(310, window.innerWidth - 24);
    const left = Math.max(12, (window.innerWidth - width) / 2);

    if (!hasTarget || !targetRect) {
      return {
        width,
        left,
        bottom: 86,
      };
    }

    const targetCenterY = targetRect.top + targetRect.height / 2;
    const placeCloudTop = targetCenterY > window.innerHeight / 2;

    return {
      width,
      left,
      top: placeCloudTop ? 16 : undefined,
      bottom: placeCloudTop ? undefined : 86,
    };
  };

  return (
    <div className="guide-layer">
      {arrowLines.length > 0 && (
        <svg
          className="guide-arrow-svg"
          width={window.innerWidth}
          height={window.innerHeight}
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        >
          <defs>
            <marker
              id="guide-arrow-head"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" className="guide-arrow-head" />
            </marker>
          </defs>

          {arrowLines.map((line, index) => (
            <line
              key={index}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              className="guide-arrow-line"
              markerEnd="url(#guide-arrow-head)"
            />
          ))}
        </svg>
      )}

      <div ref={cloudRef} className="guide-cloud" style={getCloudStyle()}>
        <div className="guide-progress">
          {stepIndex + 1} / {guideSteps.length}
        </div>

        <h3>{currentStep.title}</h3>
        <p>{popupText}</p>

        <div className="guide-actions">
          {!isFirstStep && (
            <IonButton
              fill="clear"
              size="small"
              disabled={isPreparingStep || Boolean(routeMismatch)}
              onClick={() => goToStep(stepIndex - 1)}
            >
              Back
            </IonButton>
          )}

          <IonButton fill="clear" size="small" onClick={closeGuide}>
            Skip
          </IonButton>

          {isLastStep ? (
            <IonButton size="small" onClick={closeGuide}>
              Finish
            </IonButton>
          ) : (
            <IonButton
              size="small"
              disabled={isPreparingStep || Boolean(routeMismatch)}
              onClick={() => goToStep(stepIndex + 1)}
            >
              Next
            </IonButton>
          )}
        </div>
      </div>
    </div>
  );
};

export const startLingisGuide = () => {
  window.dispatchEvent(new Event(GUIDE_ACTIVE_EVENT));
};

export default GuideOverlay;