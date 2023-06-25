function variable_info()
    info = evalin('base', 'whos');

    % Create custom sorting order
    [~, sorted_indices] = sort(upper({info.name}));

    % Rearrange info according to sorted indices
    info = info(sorted_indices);

    % Open the file
    fid = fopen('matlabInVSCodeVariableInfo.csv', 'wt');

    % Print the headers
    fprintf(fid, 'Name,Size,Class\n');

    % Loop over the variables
    for idx = 1:length(info)
        % Format the size as e.g. "5x5x5"
        size_str = strjoin(string(info(idx).size), 'x');

        % Print the variable information to the file
        fprintf(fid, '%s,%s,%s\n', info(idx).name, size_str, info(idx).class);
    end

    % Close the file
    fclose(fid);
end
