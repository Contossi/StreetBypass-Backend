const allowedObstacleTypes = [
    'lp1', //lezeci policajac - duguljasti niski ide preko cijele ceste "CRV"
    'lp2', //lezeci policajac - kratki visoki, ne može ga se izbijec "kornjaca"(ima stupic između ili je uska cesta)
    'lp3', //lezeci policajac - kratki visoki, može ga se izbijec, (siroka cesta pa se moze proci izmedu ili pored)
    'lp4', //lezeci policajac - hibrid "ide preko cijele ceste ali je i dugacak (inace kameni)"
    'kamera',
    'semafor',
    'stara_cesta'
];
function createObstacle(data) {
    return {
        type: data.type,

        location: {
            type: 'Point',
            coordinates: data.location.coordinates
        },

        city: data.city,

        verified: data.verified ?? false,

        addedBy: data.addedBy,

        createdAt: new Date(),
        updatedAt: new Date()
    };
}
export default createObstacle;