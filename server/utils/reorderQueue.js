// server/utils/reorderQueue.js

export function reorderTickets(tickets) {
    function computePriority(t) {
        if (t.priority?.emergency) return 0;
        if (t.priority?.elderly) return 1;
        if (t.priority?.prepared) return 2;
        return 3;
    }

    return tickets.sort((a, b) => {
        const pr1 = computePriority(a);
        const pr2 = computePriority(b);

        if (pr1 !== pr2) return pr1 - pr2;

        return new Date(a.bookedAt) - new Date(b.bookedAt);
    });
}
