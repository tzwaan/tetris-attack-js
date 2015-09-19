# Tetris Attack JS
An open-source implementation of the old SNES game Tetris Attack (also known as
Panel de Pon).
This aims to be an exact replica in terms of gameplay but with a couple of bugs
fixed, like chains not counting beyond 13 combos.
Furthermore, online multiplayer will be added in the future.

This is based upon an earlier code draft in go-lang in collaboration with
[jessethegame](https://github.com/jessethegame/), called
[go-attack](https://github.com/jessethegame/go-attack)

## Current state
The game is far from finished but is playable.
Currently there is only a one player mode. Blocks are randomly generated and
can form combos as well as chains. The block behaviour is very close to the
original, but there are possibly still a few bugs in some edge cases.
There are currently no checks done to see whether newly spawned blocks make a
combo or not.

## Live version
A mostly up-to-date version can be played here:
[tetris-attack-js](http://tij.men/tetris-attack-js/)

## Sprites
In the sprite section are some custom blocks that I made about 2 years ago based
on different social media logos. Some of these are out of date since either
the logos have changed, or the media stopped existing.

The first version of this implementation was created at a game jam organised by
study association [via](http://svia.nl/lang/en). An extra block sprite with the
via logo has been added.
