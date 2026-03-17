import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import TokenList from '@/components/tokens/TokenList';
import SearchFilter from '@/components/ui/SearchFilter';
import HowItWorksPopup from '@/components/notifications/HowItWorksPopup';
import SortOptions, { SortOption } from '@/components/ui/SortOptions';
import { getAllTokens, getTokensWithLiquidity, getRecentTokens, searchTokens } from '@/utils/api';
import { Token, TokenWithLiquidityEvents, PaginatedResponse } from '@/interface/types';
import SEO from '@/components/seo/SEO';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { Switch } from '@/components/ui/switch';
import Spinner from '@/components/ui/Spinner';

const TOKENS_PER_PAGE = 12;

const Home: React.FC = () => {
  const [tokens, setTokens] = useState<PaginatedResponse<Token | TokenWithLiquidityEvents> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [noRecentTokens, setNoRecentTokens] = useState(false);
  const [noLiquidityTokens, setNoLiquidityTokens] = useState(false);
  const [showNewTokens, setShowNewTokens] = useState(false);
  const [newTokensBuffer, setNewTokensBuffer] = useState<Token[]>([]);
  const [displayedNewTokens, setDisplayedNewTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { newTokens } = useWebSocket();

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setNoRecentTokens(false);
    setNoLiquidityTokens(false);
    setError(null);
    let fetchedTokens;

    try {
      if (searchQuery) {
        fetchedTokens = await searchTokens(searchQuery, currentPage, TOKENS_PER_PAGE);
      } else {
        switch (sort) {
          case 'all':
            fetchedTokens = await getAllTokens(currentPage, TOKENS_PER_PAGE);
            break;
          case 'recentCreated':
            fetchedTokens = await getRecentTokens(currentPage, TOKENS_PER_PAGE, 1);
            if (fetchedTokens === null) {
              setNoRecentTokens(true);
              fetchedTokens = { data: [], totalCount: 0, currentPage: 1, totalPages: 1 };
            }
            break;
          case 'ended':
            try {
              fetchedTokens = await getTokensWithLiquidity(currentPage, TOKENS_PER_PAGE);
            } catch (liquidityError) {
              if (liquidityError instanceof Error && 'response' in liquidityError && (liquidityError.response as { status?: number }).status === 404) {
                setNoLiquidityTokens(true);
                fetchedTokens = { data: [], totalCount: 0, currentPage: 1, totalPages: 1 };
              } else {
                throw liquidityError;
              }
            }
            break;
          case 'bomper':
            fetchedTokens = { data: [], totalCount: 0, currentPage: 1, totalPages: 1 };
            break;
          default:
            fetchedTokens = await getAllTokens(currentPage, TOKENS_PER_PAGE);
        }
      }

      const adjustedTokens: PaginatedResponse<Token | TokenWithLiquidityEvents> = {
        data: fetchedTokens.data || fetchedTokens.tokens || [],
        totalCount: fetchedTokens.totalCount,
        currentPage: fetchedTokens.currentPage || 1,
        totalPages: fetchedTokens.totalPages || 1,
        tokens: []
      };

      setTokens(adjustedTokens);
    } catch (err) {
      setError('Failed to fetch tokens. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sort, searchQuery]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    if (newTokens.length === 0) return;
    if (showNewTokens) {
      setTokens(prevTokens => {
        if (!prevTokens) return null;
        const newUniqueTokens = newTokens.filter(newToken =>
          !prevTokens.data.some(existingToken => existingToken.id === newToken.id) &&
          !displayedNewTokens.some(displayedToken => displayedToken.id === newToken.id)
        );
        setDisplayedNewTokens(prev => [...prev, ...newUniqueTokens]);
        return {
          ...prevTokens,
          data: [...newUniqueTokens, ...prevTokens.data],
          totalCount: prevTokens.totalCount + newUniqueTokens.length
        };
      });
    } else {
      setNewTokensBuffer(prev => {
        const uniqueNewTokens = newTokens.filter(newToken =>
          !prev.some(bufferToken => bufferToken.id === newToken.id)
        );
        return [...uniqueNewTokens, ...prev];
      });
    }
  }, [newTokens, showNewTokens]);

  const filteredTokens = useMemo(() => {
    if (!tokens || !tokens.data) return [];
    return tokens.data.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (option: SortOption) => {
    setSort(option);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleNewTokens = () => {
    setShowNewTokens(prev => {
      if (prev) {
        // Turning off
        setTokens(oldTokens => {
          if (!oldTokens) return null;
          const updatedTokens = {
            ...oldTokens,
            data: oldTokens.data.filter(token => !displayedNewTokens.includes(token)),
            totalCount: oldTokens.totalCount - displayedNewTokens.length
          };
          return updatedTokens;
        });
        setNewTokensBuffer(displayedNewTokens);
        setDisplayedNewTokens([]);
      } else {
        // Turning on
        setTokens(oldTokens => {
          if (!oldTokens) return null;
          const updatedTokens = {
            ...oldTokens,
            data: [...newTokensBuffer, ...oldTokens.data],
            totalCount: oldTokens.totalCount + newTokensBuffer.length
          };
          return updatedTokens;
        });
        setDisplayedNewTokens(newTokensBuffer);
        setNewTokensBuffer([]);
      }
      return !prev;
    });
  };

  return (
    <Layout>
      <SEO
        title="Create and Trade Memecoins Easily on Four Meme"
        description="The ultimate platform for launching and trading memecoins on Shibarium. Create your own tokens effortlessly and engage in fair, dynamic trading."
        image="seo/home.jpg"
      />
      <HowItWorksPopup />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg sm:text-xl font-bold text-blue-400 mb-6">Explore Tokens</h1>
        <SearchFilter onSearch={handleSearch} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <SortOptions onSort={handleSort} currentSort={sort} />
          <div className="flex items-center space-x-1">
            <Switch
              checked={showNewTokens}
              onCheckedChange={toggleNewTokens}
              aria-label="Toggle new tokens"
              className="data-[state=checked]:bg-blue-500"
            />
            <span className="text-xs text-gray-400">Show new tokens</span>
            {newTokensBuffer.length > 0 && !showNewTokens && (
              <span className="text-xs text-blue-400">({newTokensBuffer.length} new)</span>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center mt-10">
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-xl mt-10">{error}</div>
        ) : sort === 'bomper' ? (
          <div className="text-center text-white text-xs mt-10">NOTHING HERE FOR YOU</div>
        ) : noRecentTokens ? (
          <div className="text-center text-white text-xs mt-10">No tokens created in the last hour. Check back soon.</div>
        ) : noLiquidityTokens ? (
          <div className="text-center text-white text-xs mt-10">No tokens Listed Yet.</div>
        ) : filteredTokens.length > 0 ? (
          <TokenList
            tokens={filteredTokens}
            currentPage={currentPage}
            totalPages={tokens?.totalPages || 1}
            onPageChange={handlePageChange}
            isEnded={sort === 'ended'}
          />
        ) : (
          <div className="text-center text-white text-xs mt-10">No tokens found matching your criteria.</div>
        )}
      </div>
    </Layout>
  );
};

export default Home;