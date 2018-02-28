pragma solidity ^0.4.18;

import './interfaces/TokenStagesManager.sol';
import './UNITv2.sol';
import './Administrated.sol';

contract UNITStagesManager is TokenStagesManager, Administrated {
    struct StageOffer {
        uint96 pool;
        uint8 bonus;
    }

    struct Stage {
        uint32 startsAt;
        uint32 endsAt;
        StageOffer[5] offers;
    }

    Stage[3] public stages;

    uint8 public stage;
    uint8 public offer = 0;

    UNITv2 public token;

    bool internal _isDebug;

    event StageUpdated(uint8 prevStage, uint8 prefOffer, uint8 newStage, uint8 newOffer);

    modifier tokenOrAdmin() {
        require(tx.origin == administrator || (address(token) != address(0) && msg.sender == address(token)));
        _;
    }

    modifier onlyDebug() {
        require(_isDebug);
        _;
    }

    function UNITStagesManager(bool isDebug, address _token)
        public
    {
        setAdministrator(tx.origin);
        token = UNITv2(_token);
        _isDebug = isDebug;

        if (!_isDebug) {
            switchStage();
        }

        buildPreICOStage();
        buildICOStageOne();
        buildICOStageTwo();
    }

    function isDebug()
        public
        constant
        returns (bool)
    {
        return _isDebug;
    }

    function buildPreICOStage()
        internal
    {
        stages[0].startsAt = 1515610800; //10th of January 2018 at 19:00UTC
        stages[0].endsAt = 1518894000; //17th of February 2018 at 19:00UTC

        stages[0].offers[0].pool = 24705503438815932384141049; //25 mln tokens
        stages[0].offers[0].bonus = 40;
    }

    function buildICOStageOne()
        internal
    {
        stages[1].startsAt = 1519326000; //22th of February 2018 at 19:00UTC
        stages[1].endsAt = 1521745200; //22th of March 2018 at 19:00UTC

        stages[1].offers[0].pool = 5000000 * ( 10**18 ); //5 mln tokens
        stages[1].offers[0].bonus = 35; //35%

        stages[1].offers[1].pool = 5000000 * ( 10**18 ); //5 mln tokens
        stages[1].offers[1].bonus = 30; //30%

        stages[1].offers[2].pool = 5000000 * ( 10**18 ); //5 mln tokens
        stages[1].offers[2].bonus = 25; //25%

        stages[1].offers[3].pool = 5000000 * ( 10**18 ); //5 mln tokens
        stages[1].offers[3].bonus = 20; //20%

        stages[1].offers[4].pool = 122500000 * ( 10**18 ); //122.5 mln tokens
        stages[1].offers[4].bonus = 0; //0%
    }

    function buildICOStageTwo()
        internal
    {
        stages[2].startsAt = 1524250800; //20th of April 2018 at 19:00UTC
        stages[2].endsAt = 1526842800; //20th of May 2018 at 19:00UTC

        stages[2].offers[0].pool = 142794496561184067615858951;
        stages[2].offers[0].bonus = 0; //0%
    }

    function switchStage()
        public
    {
        uint8 _stage = stage;
        uint8 _offer = 0;

        while( stages.length > _stage ) {
            if (stages[_stage].endsAt <= uint32(now)) {
                _stage += 1;
                _offer = 0;
                continue;
            }

            while ( stages[_stage].offers.length > _offer ) {
                if (stages[_stage].offers[_offer].pool == 0) {
                    _offer += 1;
                } else {
                    break;
                }
            }

            if (stages[_stage].offers.length <= _offer) {
                _stage += 1;
                _offer = 0;
                continue;
            }

            break;
        }

        if (stage < _stage) {
            migratePool();
        }

        StageUpdated(stage, offer, _stage, _offer);

        stage = _stage;
        offer = _offer;
    }

    function migratePool()
        internal
    {
        if ( stage < (stages.length - 1) ) {
            for (uint8 i = 0; i < stages[stage].offers.length; i++) {
                stages[stages.length - 1].offers[0].pool += stages[stage].offers[i].pool;
                stages[stage].offers[offer].pool = 0;
            }
        }
    }

    //START Debug methods
    /*
    WARNING! This methods are for debug purpose only during testing.
    They will work only of isDebug option is set to true.
    */
    function dTimeoutCurrentStage()
        public
        onlyAdministrator
        onlyDebug
    {
        stages[stage].endsAt = uint32(now) - 10;
    }

    function dStartsNow()
        public
        onlyAdministrator
        onlyDebug
    {
        uint32 timeDiff = stages[stage].endsAt - stages[stage].startsAt;
        stages[stage].startsAt = uint32(now);
        stages[stage].endsAt = stages[stage].startsAt + timeDiff;
    }

    function dNextStage(uint32 startOffset)
        public
        onlyAdministrator
        onlyDebug
    {
        if ( stage < stages.length ) {
            dTimeoutCurrentStage();

            uint8 newStage = stage + 1;
            uint32 timeDiff = stages[newStage].endsAt - stages[newStage].startsAt;

            stages[newStage].startsAt = uint32(now) + startOffset;
            stages[newStage].endsAt = stages[newStage].startsAt + timeDiff;

            switchStage();
        }
    }

    function dNextOffer()
        public
        onlyAdministrator
        onlyDebug
    {
        offer++;
    }
    
    function dAlterPull(uint96 numTokens)
        public
        onlyAdministrator
        onlyDebug
    {
        withdrawTokensFromPool(numTokens);
    }

    function dGetPool(uint8 _stage, uint8 _offer)
        public
        onlyAdministrator
        onlyDebug
        view
        returns (uint96)
    {
        return stages[_stage].offers[_offer].pool;
    }
    //END Debug methods

    function withdrawTokensFromPool(uint96 numTokens)
        internal
    {
        require(numTokens <= stages[stage].offers[offer].pool);

        stages[stage].offers[offer].pool -= numTokens;
    }

    function getCurrentStage()
        public
        view
        returns (uint32 startsAt, uint32 endsAt, uint96 pool, uint8 bonus)
    {
        if ( stage < stages.length ) {
            startsAt = stages[stage].startsAt;
            endsAt = stages[stage].endsAt;
            pool = stages[stage].offers[offer].pool;
            bonus = stages[stage].offers[offer].bonus;
        }
    }

    function setToken(address tokenAddress)
        public
        onlyAdministrator
    {
        token = UNITv2(tokenAddress);
    }

    function getPool()
        public
        constant
        returns (uint96)
    {
        if (isICO()) {
            return stages[stage].offers[offer].pool;
        } else {
            return 0;
        }
    }

    function getBonus()
        public
        constant
        returns (uint96)
    {
        if (isICO()) {
            return stages[stage].offers[offer].pool;
        } else {
            return 0;
        }
    }

    function isTimeout()
        public
        constant
        returns (bool)
    {
        return now < stages[stage].endsAt;
    }

    function isICO()
        public
        constant
        returns(bool)
    {
        return stage < stages.length;
    }

    function isCanList()
        public
        constant
        returns (bool)
    {
        return isICO();
    }
}
