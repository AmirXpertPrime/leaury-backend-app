exports.getNewArrivalsTags = async (req, res) => {
    const now = new Date().toISOString();
    try {
        res.status(200).json({
            message: 'New Arrivals Tags fetched successfully',
            status: 200,
            data: [
                {
                    id: 1,
                    name: "SHOES COLLECTION",
                    tag_type: "shoes",
                    created_at: "2025-12-09T19:13:48.000000Z",
                    updated_at: "2025-12-09T19:13:48.000000Z"
                },
                {
                    id: 2,
                    name: "BAGS COLLECTION",
                    tag_type: "bags",
                    created_at: "2025-12-09T19:13:48.000000Z",
                    updated_at: "2025-12-09T19:13:48.000000Z"
                },
                {
                    id: 3,
                    name: "OLYMPUS COLLECTION",
                    tag_type: "olympus",
                    created_at: "2025-12-09T19:13:48.000000Z",
                    updated_at: "2025-12-09T19:13:48.000000Z"
                },
                {
                    id: 4,
                    name: "EXCLUSIVE COLLECTION",
                    tag_type: "exclusive",
                    created_at: "2025-12-09T19:39:06.000000Z",
                    updated_at: "2025-12-09T19:39:06.000000Z"
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 500 });
    }
};