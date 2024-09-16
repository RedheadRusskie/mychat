import { useCallback, useEffect, useRef } from "react";
import { useDebouncedState, useSearchUser } from "@/lib/hooks";
import { Search2Icon, WarningIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Center,
  Flex,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

export const UserSearchSelect = () => {
  const [query, setQuery] = useDebouncedState<string | null>(null, 400);
  const searchResultsContainerRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const {
    usersQueryResult,
    isUsersQueryLoading,
    usersQueryError,
    fetchNextPage,
    hasNextPage,
  } = useSearchUser(query);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchResultsContainerRef.current &&
        !searchResultsContainerRef.current.contains(event.target as Node)
      )
        onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside, isOpen]);

  if (usersQueryError) {
    toast({
      title: usersQueryError.message,
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top",
    });
  }

  const handleScroll = () => {
    if (
      searchResultsContainerRef.current &&
      searchResultsContainerRef.current.scrollTop +
        searchResultsContainerRef.current.clientHeight >=
        searchResultsContainerRef.current.scrollHeight &&
      hasNextPage
    )
      fetchNextPage();
  };

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value || null);

      if (event.target.value) onOpen();
      else onClose();
    },
    [onClose, onOpen, setQuery]
  );

  return (
    <Center
      h="4em"
      flexDir="column"
      backgroundColor="#1C173E"
      borderRadius="30px"
    >
      <Box
        width="80%"
        h="60%"
        border="2px solid var(--light-main)"
        padding="0.5em 0.8em;"
        borderRadius="30px;"
      >
        <Flex alignItems="center">
          <Input
            onChange={(event) => handleInputChange(event)}
            bgColor="transparent"
            border="none"
            width="100%"
            height="100%"
            _focus={{
              boxShadow: "none",
              outlineWidth: 0,
            }}
            _placeholder={{ color: "var(--light-main)" }}
            color="#fff"
            variant="unstyled"
            mr="7px"
            placeholder="Search conversations"
          />
          {isUsersQueryLoading ? (
            <Spinner size="sm" color="var(--light-main)" />
          ) : (
            <Search2Icon height="100%" color="var(--light-main)" />
          )}
        </Flex>
      </Box>
      {isOpen && usersQueryResult && (
        <Box
          ref={searchResultsContainerRef}
          maxH="20em"
          overflowY="scroll"
          position="absolute"
          top="9em"
          minW="20.8em"
          bgColor="white"
          borderRadius="10px"
          boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
          zIndex="999"
          left="3.5em"
          backgroundColor="var(--bg-main)"
          onScroll={handleScroll}
        >
          {!isUsersQueryLoading && usersQueryResult.length === 0 && (
            <Center color="white" pt="1em">
              <Flex
                gap="0.5em"
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <WarningIcon fontSize="1.5rem" color="var(--light-main)" />
                No users found
              </Flex>
            </Center>
          )}
          <List>
            {usersQueryResult.map((user) => (
              <ListItem
                transition="0.3s"
                color="white"
                borderRadius="10px"
                key={user.userId}
                padding="0.5em"
                _hover={{ backgroundColor: "var(--hover)", cursor: "pointer" }}
                onClick={onClose}
              >
                <Flex gap="0.5em">
                  <Avatar src={user.profilePicture as string} size="xs" />
                  <Text>{user.name}</Text>
                  <Text color="var(--light-main)">@{user.username}</Text>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Center>
  );
};
