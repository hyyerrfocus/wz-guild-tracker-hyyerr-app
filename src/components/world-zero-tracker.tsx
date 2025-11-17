import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Edit2, Check, X, StickyNote, RefreshCw } from 'lucide-react';

const WorldZeroTracker = () => {
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [history, setHistory] = useState({});
  const [notes, setNotes] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [currentSeason, setCurrentSeason] = useState(18);
  const [showSeasonModal, setShowSeasonModal] = useState(false);

  // Get today's date string in EST
  const getTodayEST = () => {
    const now = new Date();
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    if (est.getHours() < 17) est.setDate(est.getDate() - 1);
    return est.toISOString().split('T')[0];
  };

  const getResetTime = () => {
    const now = new Date();
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const reset = new Date(est);
    reset.setHours(17, 0, 0, 0);

    if (est.getHours() >= 17) reset.setDate(reset.getDate() + 1);

    const diff = reset - est;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const [currentDate] = useState(getTodayEST());
  const [timeUntilReset, setTimeUntilReset] = useState(getResetTime());

  useEffect(() => {
    const interval = setInterval(() => setTimeUntilReset(getResetTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('hyyerr_player_name');
    if (storedName) setPlayerName(storedName);

    const storedSeason = localStorage.getItem('hyyerr_current_season');
    if (storedSeason) setCurrentSeason(parseInt(storedSeason));

    const seasonKey = `season${storedSeason || 18}`;

    const storedHistory = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
    if (storedHistory) setHistory(JSON.parse(storedHistory));

    const storedNotes = localStorage.getItem(`hyyerr_notes_${seasonKey}`);
    if (storedNotes) setNotes(JSON.parse(storedNotes));
  }, []);

  // Load today's saved player
  useEffect(() => {
    const stored = localStorage.getItem(`hyyerr_player_${currentDate}`);
    if (stored) setCurrentPlayer(JSON.parse(stored));
  }, [currentDate]);

  // Save player + auto history save
  useEffect(() => {
    if (!currentPlayer) return;

    localStorage.setItem(`hyyerr_player_${currentDate}`, JSON.stringify(currentPlayer));

    const pts = calculatePoints(currentPlayer);
    const seasonKey = `season${currentSeason}`;
    const updated = { ...history, [currentDate]: pts };
    setHistory(updated);
    localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(updated));
  }, [currentPlayer]);

  const initializePlayer = () => {
    if (!playerName.trim()) return;

    localStorage.setItem('hyyerr_player_name', playerName.trim());

    const stored = localStorage.getItem(`hyyerr_player_${currentDate}`);
    if (stored) {
      setCurrentPlayer(JSON.parse(stored));
      return;
    }

    setCurrentPlayer({
      name: playerName.trim(),
      dungeons: {},
      worldEvents: {},
      towers: {},
      infiniteTower: { floor: 0 },
      guildQuests: { easy: false, medium: false, hard: false }
    });
  };

  const updateCompletion = (category, key, value) => {
    const updated = { ...currentPlayer };
    if (category === 'guildQuests' || category === 'infiniteTower') {
      updated[category] = { ...updated[category], ...value };
    } else {
      updated[category] = { ...updated[category], [key]: value };
    }
    setCurrentPlayer(updated);
  };

  const startEdit = (date, points) => {
    setEditingDate(date);
    setEditValue(points.toString());
  };

  const saveEdit = () => {
    if (!editingDate) return;

    const seasonKey = `season${currentSeason}`;
    const updated = { ...history, [editingDate]: parseInt(editValue) || 0 };
    setHistory(updated);
    localStorage.setItem(`hyyerr_points_history_${seasonKey}`, JSON.stringify(updated));
    setEditingDate(null);
  };

  const startNoteEdit = (date) => {
    setEditingNote(date);
    setNoteValue(notes[date] || '');
  };

  const saveNote = () => {
    if (!editingNote) return;

    const seasonKey = `season${currentSeason}`;
    const updated = { ...notes, [editingNote]: noteValue };
    setNotes(updated);
    localStorage.setItem(`hyyerr_notes_${seasonKey}`, JSON.stringify(updated));

    setEditingNote(null);
    setNoteValue('');
  };

  const cancelNote = () => {
    setEditingNote(null);
    setNoteValue('');
  };

  const cancelEdit = () => {
    setEditingDate(null);
    setEditValue('');
  };

  const startNewSeason = () => {
    const newSeason = currentSeason + 1;
    setCurrentSeason(newSeason);
    setHistory({});
    setNotes({});
    localStorage.setItem('hyyerr_current_season', newSeason.toString());
    setShowSeasonModal(false);
  };

  const viewPastSeason = () => {
    const season = prompt(`Enter season number to view (current: ${currentSeason}):`);
    if (!season) return;

    const num = parseInt(season);
    if (num < 1 || num > currentSeason) return;

    setCurrentSeason(num);
    localStorage.setItem('hyyerr_current_season', num.toString());

    const seasonKey = `season${num}`;
    const storedHistory = localStorage.getItem(`hyyerr_points_history_${seasonKey}`);
    const storedNotes = localStorage.getItem(`hyyerr_notes_${seasonKey}`);

    setHistory(storedHistory ? JSON.parse(storedHistory) : {});
    setNotes(storedNotes ? JSON.parse(storedNotes) : {});
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // WORLDS DATA
  const worlds = [
    {
      num: 1,
      color: 'bg-slate-600',
      bosses: ['Big Tree Guardian', 'Crab Prince', 'Dire Boarwolf'],
      dungeons: [
        { name: '1-1 Crabby Crusade', normal: 1, challenge: 2 },
        { name: '1-2 Scarecrow Defense', normal: 1, challenge: 2 },
        { name: '1-3 Dire Problem', normal: 1, challenge: 2 },
        { name: '1-4 Kingslayer', normal: 1, challenge: 2 },
        { name: '1-5 Gravetower Dungeon', normal: 1, challenge: 2 },
      ]
    },
    {
      num: 2,
      color: 'bg-green-600',
      bosses: ['Big Poison Flower', 'Dark Goblin Knight', 'Red Goblins'],
      dungeons: [
        { name: '2-1 Temple of Ruin', normal: 1, challenge: 2 },
        { name: '2-2 Mama Trauma', normal: 1, challenge: 2 },
        { name: "2-3 Volcano's Shadow", normal: 2, challenge: 3 },
        { name: '2-4 Volcano Dungeon', normal: 2, challenge: 3 },
      ]
    },
    {
      num: 3,
      color: 'bg-blue-600',
      bosses: ['Icy Blob', 'Castle Commander', 'Dragon Protector'],
      dungeons: [
        { name: '3-1 Mountain Pass', normal: 2, challenge: 3 },
        { name: '3-2 Winter Cavern', normal: 2, challenge: 3 },
        { name: '3-3 Winter Dungeon', normal: 2, challenge: 3 },
      ]
    },
    {
      num: 4,
      color: 'bg-orange-600',
      bosses: ['Elder Golem', 'Buff Twins (Cac & Tus)', 'Fire Scorpion'],
      dungeons: [
        { name: '4-1 Scrap Canyon', normal: 3, challenge: 4 },
        { name: '4-2 Deserted Burrowmine', normal: 3, challenge: 4 },
        { name: '4-3 Pyramid Dungeon', normal: 3, challenge: 4 },
      ]
    },
    {
      num: 5,
      color: 'bg-pink-600',
      bosses: ['Great Blossom Tree', 'Blue Goblin Gatekeeper', 'Hand of Ignis'],
      dungeons: [
        { name: '5-1 Konoh Heartlands', normal: 3, challenge: 4 },
        { name: '5-2 Konoh Inferno', normal: 4, challenge: 5 },
      ]
    },
    {
      num: 6,
      color: 'bg-teal-600',
      bosses: ['Whirlpool Scorpion', 'Lava Shark'],
      dungeons: [
        { name: '6-1 Rough Waters', normal: 4, challenge: 5 },
        { name: '6-2 Treasure Hunt', normal: 4, challenge: 5 },
      ]
    },
    {
      num: 7,
      color: 'bg-red-600',
      bosses: ['Son of Ignis', 'Hades', 'Minotaur'],
      dungeons: [
        { name: '7-1 The Underworld', normal: 5, challenge: 6 },
        { name: '7-2 The Labyrinth', normal: 5, challenge: 6 },
      ]
    },
    {
      num: 8,
      color: 'bg-yellow-700',
      bosses: ['Gargantigator', 'Ancient Emerald Guardian', 'Toa: Tree of the Ruins', 'Ruinous, Poison Dragon'],
      dungeons: [
        { name: '8-1 Rescue in the Ruins', normal: 5, challenge: 6 },
        { name: '8-2 Ruin Rush', normal: 6, challenge: 7 },
      ]
    },
    {
      num: 9,
      color: 'bg-purple-700',
      bosses: ['Aether Lord', 'Giant Minotaur', 'Redwood Mammoose'],
      dungeons: [
        { name: '9-1 Treetop Trouble', normal: 6, challenge: 7 },
        { name: '9-2 Aether Fortress', normal: 6, challenge: 7 },
      ]
    },
    {
      num: 10,
      color: 'bg-fuchsia-800',
      bosses: ['Crystal Assassin', 'Crystal Alpha', 'Crystal Tyrant'],
      dungeons: [
        { name: '10-1 Crystal Chaos', normal: 7, challenge: 8 },
        { name: '10-2 Astral Academy', normal: 7, challenge: 8 },
      ]
    }
  ];

  const towers = [
    { name: 'Prison Tower', points: 15, color: 'bg-pink-300' },
    { name: 'Atlantis Tower', points: 15, color: 'bg-cyan-400' },
    { name: 'Mezuvian Tower', points: 15, color: 'bg-red-400' },
    { name: 'Oasis Tower', points: 15, color: 'bg-orange-300' },
    { name: 'Aether Tower', points: 15, color: 'bg-purple-400' },
    { name: 'Arcane Tower', points: 15, color: 'bg-pink-500' },
    { name: 'Celestial Tower', points: 15, color: 'bg-yellow-400' }
  ];

  // WORLD COMPLETION PERCENT
  const calculateWorldCompletion = (worldNum) => {
    if (!currentPlayer) return { completed: 0, total: 0, percentage: 0 };

    const world = worlds.find(w => w.num === worldNum);
    if (!world) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    world.dungeons.forEach(d => {
      total += 2;
      if (currentPlayer.dungeons[`${d.name}_normal`]) completed++;
      if (currentPlayer.dungeons[`${d.name}_challenge`]) completed++;
    });

    world.bosses.forEach(boss => {
      total++;
      if (currentPlayer.worldEvents[`world${world.num}_${boss}`]) completed++;
    });

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  // FIXED POINT CALCULATION FUNCTION (previously broken)
  const calculatePoints = (player) => {
    if (!player) return 0;

    let points = 0;

    // Dungeons
    worlds.forEach(world => {
      world.dungeons.forEach(dungeon => {
        if (player.dungeons[`${dungeon.name}_normal`]) points += dungeon.normal;
        if (player.dungeons[`${dungeon.name}_challenge`]) points += dungeon.challenge;
      });
    });

    // Bosses
    worlds.forEach(world => {
      world.bosses.forEach(boss => {
        if (player.worldEvents[`world${world.num}_${boss}`]) points += 1;
      });
    });

    // Towers
    towers.forEach(tower => {
      if (player.towers[tower.name]) points += 15;
    });

    // Infinite tower
    if (player.infiniteTower.floor > 0) {
      points += Math.floor(player.infiniteTower.floor / 5) * 5;
    }

    // Guild quests
    if (player.guildQuests.easy) points += 25;
    if (player.guildQuests.medium) points += 50;
    if (player.guildQuests.hard) points += 100;

    return points;
  };

  // History
  const getRecentHistory = () => {
    const dates = Object.keys(history).sort().reverse();
    return dates.slice(0, 7).map(date => ({
      date,
      points: history[date]
    }));
  };

  const recentHistory = getRecentHistory();
  const totalPoints = Object.values(history).reduce((a, b) => a + b, 0);
  const avgPoints = recentHistory.length > 0 ? Math.round(totalPoints / Object.keys(history).length) : 0;

  // If player not set
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/30">

            {/* HEADER */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center gap-3">
                <Trophy className="text-yellow-400" size={52} />
                THE HYYERR GUILD
              </h1>

              <p className="text-xl text-yellow-300 mt-2">
                World // Zero Daily Tracker — Season {currentSeason}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Tracking for <strong className="text-white">{formatDate(currentDate)}</strong>
              </p>
            </div>

            {/* HISTORY DISPLAY */}
            {recentHistory.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar size={24} className="text-yellow-400" /> Recent Point History
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentHistory.map(({ date, points }) => {
                    const isToday = date === currentDate;
                    return (
                      <div key={date} className={`rounded-xl p-3 border ${isToday ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                              {formatDate(date)}
                              {isToday && <span className="text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full text-xs">Today</span>}
                            </div>

                            <div className={`text-2xl font-bold ${points >= 300 ? 'text-green-400' : 'text-yellow-300'}`}>
                              {points} pts
                            </div>
                          </div>

                          {!isToday && (
                            <div className="flex gap-2">
                              <button onClick={() => startNoteEdit(date)} className="text-gray-400 hover:text-blue-400">
                                <StickyNote size={18} />
                              </button>
                              <button onClick={() => startEdit(date, points)} className="text-gray-400 hover:text-white">
                                <Edit2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {notes[date] && (
                          <div className="text-xs text-gray-400 bg-black/20 p-2 mt-2 rounded">
                            <StickyNote size={12} className="inline-block mr-1" />
                            {notes[date]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ENTER NAME */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg text-white mb-4">Enter Your Roblox Name</h3>
              <div className="flex gap-3">
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Roblox username"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <button
                  onClick={initializePlayer}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded-lg"
                >
                  Start
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Today's points
  const myPoints = calculatePoints(currentPlayer);

  const [showCelebration, setShowCelebration] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);

  useEffect(() => {
    if (myPoints >= 300 && lastPoints < 300) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setLastPoints(myPoints);
  }, [myPoints]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-2xl p-6 mb-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 flex items-center gap-2">
                <Trophy className="text-yellow-400" /> {currentPlayer.name}
              </h1>
              <p className="text-yellow-200">
                Season {currentSeason} • {formatDate(currentDate)}
              </p>
            </div>

            <button
              onClick={() => setCurrentPlayer(null)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded-lg"
            >
              View History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
              <div className="text-gray-300 text-sm">Today's Points</div>
              <div className={`text-4xl font-bold ${myPoints >= 300 ? 'text-green-400' : 'text-yellow-300'}`}>
                {myPoints}
                <span className="text-lg text-gray-400 ml-2">/ 300</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${myPoints >= 300 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((myPoints / 300) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-gray-300 text-sm">Total Points</div>
              <div className="text-3xl font-bold text-blue-300">{totalPoints}</div>
            </div>

            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <div className="text-gray-300 text-sm">Daily Average</div>
              <div className="text-3xl font-bold text-green-300">{avgPoints}</div>
            </div>

          </div>
        </div>

        {/* --------------------------- */}
        {/* GUILD QUESTS */}
        {/* --------------------------- */}

        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl text-white font-bold mb-4 flex items-center gap-2">
            <Target className="text-green-400" />
            Guild Quests (175 pts)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <label className="flex items-center gap-3 bg-green-500/20 p-4 rounded-lg cursor-pointer border border-green-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.easy}
                onChange={(e) => updateCompletion('guildQuests', null, { easy: e.target.checked })}
              />
              <div>
                <div className="text-white font-medium">Easy Quest</div>
                <div className="text-green-400 text-sm">25 pts</div>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-orange-500/20 p-4 rounded-lg cursor-pointer border border-orange-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.medium}
                onChange={(e) => updateCompletion('guildQuests', null, { medium: e.target.checked })}
              />
              <div>
                <div className="text-white font-medium">Medium Quest</div>
                <div className="text-orange-400 text-sm">50 pts</div>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-red-500/20 p-4 rounded-lg cursor-pointer border border-red-500/30">
              <input
                type="checkbox"
                checked={currentPlayer.guildQuests.hard}
                onChange={(e) => updateCompletion('guildQuests', null, { hard: e.target.checked })}
              />
              <div>
                <div className="text-white font-medium">Hard Quest</div>
                <div className="text-red-400 text-sm">100 pts</div>
              </div>
            </label>

          </div>
        </div>

        {/* --------------------------- */}
        {/* TOWERS */}
        {/* --------------------------- */}

        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl text-white font-bold mb-4">Towers (15 pts each)</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">

            {towers.map(tower => (
              <label key={tower.name} className={`flex items-center gap-3 ${tower.color} bg-opacity-20 p-4 rounded-lg cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={currentPlayer.towers[tower.name] || false}
                  onChange={(e) => updateCompletion('towers', tower.name, e.target.checked)}
                />
                <div>
                  <div className="text-white font-medium">{tower.name}</div>
                  <div className="text-purple-300 text-xs">15 pts</div>
                </div>
              </label>
            ))}

          </div>

          {/* infinite tower */}
          <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-300/30">
            <div className="text-white font-medium mb-3">Infinite Tower</div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={currentPlayer.infiniteTower.floor}
                onChange={(e) => updateCompletion('infiniteTower', null, { floor: parseInt(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
              />

              <div className="text-purple-300 font-bold">
                +{Math.floor((currentPlayer.infiniteTower.floor || 0) / 5) * 5}
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------- */}
        {/* WORLDS / DUNGEONS */}
        {/* --------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {worlds.map(world => {
            const complete = calculateWorldCompletion(world.num);

            return (
              <div key={world.num} className={`${world.color} bg-opacity-20 rounded-2xl p-6 border border-white/20`}>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl text-white font-bold">World {world.num}</h3>

                  {complete.percentage === 100 && (
                    <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} />
                      Complete
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{complete.completed}/{complete.total} completed</span>
                    <span className="text-xs text-gray-400">{complete.percentage}%</span>
                  </div>
                  <div className="bg-black/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full 
                        ${complete.percentage === 100 ? 'bg-green-500' :
                        complete.percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${complete.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Bosses */}
                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="text-white text-sm mb-2">World Bosses (1pt each)</div>
                  <div className="flex flex-col gap-2">
                    {world.bosses.map(boss => (
                      <label key={boss} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentPlayer.worldEvents[`world${world.num}_${boss}`] || false}
                          onChange={(e) => updateCompletion('worldEvents', `world${world.num}_${boss}`, e.target.checked)}
                        />
                        <span className="text-gray-300 text-sm">{boss}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dungeons */}
                <div className="space-y-3">
                  {world.dungeons.map(dungeon => (
                    <div key={dungeon.name} className="bg-black/20 rounded-lg p-3">
                      <div className="text-white text-sm mb-2">{dungeon.name}</div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={currentPlayer.dungeons[`${dungeon.name}_normal`] || false}
                            onChange={(e) => updateCompletion('dungeons', `${dungeon.name}_normal`, e.target.checked)}
                          />
                          Normal ({dungeon.normal})
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={currentPlayer.dungeons[`${dungeon.name}_challenge`] || false}
                            onChange={(e) => updateCompletion('dungeons', `${dungeon.name}_challenge`, e.target.checked)}
                          />
                          Challenge ({dungeon.challenge})
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* CELEBRATION */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xl bg-black/40">
            <div className="p-12 bg-green-500/20 border-4 border-green-400 rounded-3xl animate-bounce">
              <Trophy className="text-yellow-400 mx-auto mb-4" size={80} />
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                300 Points Reached!
              </h2>
            </div>
          </div>
        )}

      </div>

      {/* EDIT POINTS MODAL */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-yellow-500/30">
            <h3 className="text-xl text-white font-bold mb-4">Edit Points</h3>

            <p className="text-gray-400 text-sm mb-4">{formatDate(editingDate)}</p>

            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              >
                <Check size={18} /> Save
              </button>

              <button
                onClick={cancelEdit}
                className="flex-1 p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-blue-500/30">

            <h3 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
              <StickyNote size={20} /> Add Note
            </h3>

            <p className="text-gray-400 text-sm mb-4">{formatDate(editingNote)}</p>

            <textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4 min-h-[100px]"
            />

            <div className="flex gap-3">
              <button
                onClick={saveNote}
                className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                <Check size={18} /> Save Note
              </button>

              <button
                onClick={cancelNote}
                className="flex-1 p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                <X size={18} /> Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default WorldZeroTracker;
