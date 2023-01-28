type Props = {
    collections: {
        quantity: number;
        player: {
            id: number;
            name: string;
        };
    }[];
};

const container: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "min-content min-content min-content 1fr",
    gap: "20px 0px",
    gridTemplateAreas: `"first first first" "second second second" "third third third" "a b c"`,
};

export default function Ranking({ collections }: Props) {
    const [first, second, third, ...rest] = collections;
    return (
        <div style={container}>
            {[
                {
                    data: first,
                    gridArea: "first",
                    icon: "🥇",
                },
                { data: second, gridArea: "second", icon: "🥈" },
                { data: third, gridArea: "third", icon: "🥉" },
            ].map(
                ({ data, gridArea, icon }, i) =>
                    data && (
                        <div style={{ gridArea }} key={i}>
                            {icon} {data.player.name} (
                            {data.quantity.toLocaleString()})
                        </div>
                    )
            )}
            {rest.length > 0 &&
                ["a", "b", "c"].map((gridArea, index) => (
                    <div style={{ gridArea }} key={index}>
                        {rest
                            .filter((_c, i) => i % 3 === index)
                            .map((c, i) => (
                                <div key={c.player.id}>
                                    #{i * 3 + 4 + index} {c.player.name} (
                                    {c.quantity.toLocaleString()})
                                </div>
                            ))}
                    </div>
                ))}
        </div>
    );
}
