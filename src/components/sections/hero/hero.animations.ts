import gsap from "gsap";

type HeroAnimationRefs = {
    label: HTMLSpanElement | null;
    title: HTMLHeadingElement | null;
    description: HTMLParagraphElement | null;
    buttons: HTMLDivElement | null;
    pagination: HTMLDivElement | null;
};

export const animateHeroEntrance = ({
    label,
    title,
    description,
    buttons,
    pagination,
}: HeroAnimationRefs) => {
    const tl = gsap.timeline();

    tl.fromTo(
        label,
        {
            y: 30,
            opacity: 0,
        },
        {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
        }
    )
        .fromTo(
            title?.children || [],
            {
                y: 80,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                duration: 0.8,
                ease: "power4.out",
            },
            "-=0.2"
        )
        .fromTo(
            description,
            {
                y: 20,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.4"
        )
        .fromTo(
            buttons?.children || [],
            {
                y: 20,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.3"
        )
        .fromTo(
            pagination,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 0.4,
            },
            "-=0.2"
        );
};

export const animateHeroSlideChange = (
    description: HTMLParagraphElement | null
) => {
    if (!description) return;

    gsap.killTweensOf(description);

    gsap.fromTo(
        description,
        {
            opacity: 0,
            y: 20,
        },
        {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
        }
    );
};

export const animatePaginationBar = (
    pagination: HTMLDivElement | null
) => {
    if (!pagination) return;

    const activeBar = pagination.querySelector(
        ".heroPaginationBar.isActive"
    );

    if (!activeBar) return;

    gsap.killTweensOf(activeBar);

    gsap.fromTo(
        activeBar,
        {
            scaleX: 0,
            transformOrigin: "left center",
        },
        {
            scaleX: 1,
            duration: 4,
            ease: "none",
        }
    );
};