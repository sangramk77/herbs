interface MissionVisionProps {
    missionText: string | null;
    visionText: string | null;
}

export function MissionVision({ missionText, visionText }: MissionVisionProps) {
    if (!missionText && !visionText) return null;

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="overflow-hidden rounded-[2rem] border border-fuchsia-100 bg-white/88 shadow-2xl shadow-fuchsia-950/10 backdrop-blur-sm">
                    <div className="grid lg:grid-cols-[2fr_1fr]">
                        {missionText && (
                            <div className="bg-fuchsia-50/60 p-7 sm:p-9 md:p-12 lg:min-h-[300px]">
                                <h2 className="mb-7 text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
                                    Our Mission
                                </h2>

                                <div
                                    className="text-fuchsia-900 [&_li]:relative [&_li]:mb-5 [&_li]:pl-11 [&_li]:text-lg [&_li]:leading-relaxed [&_li]:font-medium [&_li]:before:absolute [&_li]:before:top-1 [&_li]:before:left-0 [&_li]:before:flex [&_li]:before:h-7 [&_li]:before:w-7 [&_li]:before:items-center [&_li]:before:justify-center [&_li]:before:rounded-full [&_li]:before:bg-fuchsia-900 [&_li]:before:text-base [&_li]:before:font-bold [&_li]:before:text-white [&_li]:before:content-['›'] [&_ol]:list-none [&_ol]:pl-0 [&_p]:mb-5 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:font-medium [&_ul]:list-none [&_ul]:pl-0"
                                    dangerouslySetInnerHTML={{
                                        __html: missionText,
                                    }}
                                />
                            </div>
                        )}

                        {visionText && (
                            <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-7 text-white sm:p-9 md:p-12 lg:min-h-[300px]">
                                <h2 className="mb-7 text-3xl font-extrabold tracking-tight md:text-4xl">
                                    Our Vision
                                </h2>

                                <div
                                    className="[&_li]:relative [&_li]:mb-7 [&_li]:pl-11 [&_li]:text-lg [&_li]:leading-relaxed [&_li]:font-medium [&_li]:before:absolute [&_li]:before:top-1 [&_li]:before:left-0 [&_li]:before:flex [&_li]:before:h-7 [&_li]:before:w-7 [&_li]:before:items-center [&_li]:before:justify-center [&_li]:before:rounded-full [&_li]:before:bg-white [&_li]:before:text-base [&_li]:before:font-bold [&_li]:before:text-fuchsia-500 [&_li]:before:content-['›'] [&_ol]:list-none [&_ol]:pl-0 [&_p]:mb-7 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:font-medium [&_ul]:list-none [&_ul]:pl-0"
                                    dangerouslySetInnerHTML={{
                                        __html: visionText,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
