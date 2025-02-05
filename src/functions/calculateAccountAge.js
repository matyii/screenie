const calculateAccountAge = (registrationDate) => {
    const registration = new Date(registrationDate);
    const now = new Date();
    const diff = now - registration;
    const age = diff / (1000 * 60 * 60 * 24 * 365.25);
    return age.toFixed(2);
};

module.exports = calculateAccountAge;