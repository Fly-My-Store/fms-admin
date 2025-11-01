import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const ActivityStatusChart = ({ activities = [] }) => {
    const statusLabels = {
        1: 'Yet to Start',
        2: 'In Progress',
        3: 'Submitted',
        4: 'Verified'
    };

    const groupActivitiesByStatus = (activities) => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        activities.forEach((a) => {
            counts[a.progress] += 1;
        });

        return Object.entries(counts).map(([key, value]) => ({
            name: statusLabels[key],
            count: value
        }));
    };
    const data = groupActivitiesByStatus(activities);

    return (
        <BarChart width={300} height={200} data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    );
};
export default ActivityStatusChart;