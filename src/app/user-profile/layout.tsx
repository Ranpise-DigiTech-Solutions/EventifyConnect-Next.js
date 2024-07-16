import React from 'react';

const UserProfileLayout = ({ children } : { children: React.ReactNode }) => {
    return (
        <main>
            {children}
        </main>
    )
}

export default UserProfileLayout;